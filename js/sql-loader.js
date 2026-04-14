// Small SQL.js bootstrap proxy for GitHub Pages deployments.
// It lets both the older and newer app bundles recover from CDN/WASM issues
// without needing to rewrite the main React app file.

(function () {
  const SQL_JS_VERSION = "1.10.3";
  const PROXY_MARKER = "__reelTroubleSqlProxy__";
  const wasmCandidates = [
    {
      script: `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/sql-wasm.js`,
      base: `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/`
    },
    {
      script: `https://unpkg.com/sql.js@${SQL_JS_VERSION}/dist/sql-wasm.js`,
      base: `https://unpkg.com/sql.js@${SQL_JS_VERSION}/dist/`
    }
  ];
  const asmCandidates = [
    `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/sql-asm.js`,
    `https://unpkg.com/sql.js@${SQL_JS_VERSION}/dist/sql-asm.js`
  ];

  let modulePromise = null;

  function patchDatabaseExec(SQL) {
    if (!SQL?.Database?.prototype || SQL.Database.prototype.__reelTroubleExecPatched) {
      return SQL;
    }

    const originalExec = SQL.Database.prototype.exec;
    SQL.Database.prototype.exec = function patchedExec(sql, params, config) {
      const results = originalExec.call(this, sql, params, config);
      if (!Array.isArray(results) || results.length > 0 || typeof sql !== "string") {
        return results;
      }

      const normalizedSql = sql.trim().replace(/^\uFEFF/, "");
      if (!/^(select|with)\b/i.test(normalizedSql)) {
        return results;
      }

      let statement = null;
      try {
        statement = this.prepare(normalizedSql, params);
        const columns = typeof statement.getColumnNames === "function"
          ? statement.getColumnNames()
          : [];
        const values = [];

        while (statement.step()) {
          values.push(statement.get());
        }

        if (columns.length > 0) {
          return [{ columns, values }];
        }
      } catch (error) {
        console.warn("SQL.js empty-result patch failed.", error);
      } finally {
        statement?.free?.();
      }

      return results;
    };

    SQL.Database.prototype.__reelTroubleExecPatched = true;
    return SQL;
  }

  function isRealInitSqlJs(fn) {
    return typeof fn === "function" && fn[PROXY_MARKER] !== true;
  }

  function appendScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find((script) => script.src === src);
      const script = existing || document.createElement("script");
      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out loading ${src}`));
      }, 12000);

      function cleanup() {
        window.clearTimeout(timeoutId);
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      }

      function handleLoad() {
        script.dataset.loaded = "true";
        cleanup();
        resolve();
      }

      function handleError() {
        cleanup();
        reject(new Error(`Failed to load ${src}`));
      }

      if (existing && script.dataset.loaded === "true") {
        cleanup();
        resolve();
        return;
      }

      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });

      if (!existing) {
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  async function loadWasmModule(config) {
    let lastError = null;

    for (const candidate of wasmCandidates) {
      try {
        await appendScriptOnce(candidate.script);
        if (!isRealInitSqlJs(window.initSqlJs)) {
          throw new Error("SQL.js script loaded but initSqlJs is unavailable.");
        }

        return patchDatabaseExec(await window.initSqlJs({
          ...(config || {}),
          locateFile: (config && config.locateFile) || ((file) => `${candidate.base}${file}`)
        }));
      } catch (error) {
        lastError = error;
        console.warn("SQL.js WASM bootstrap failed.", candidate.script, error);
      }
    }

    throw lastError || new Error("Unable to load sql-wasm.js.");
  }

  async function loadAsmModule() {
    let lastError = null;

    for (const scriptUrl of asmCandidates) {
      try {
        await appendScriptOnce(scriptUrl);
        if (!isRealInitSqlJs(window.initSqlJs)) {
          throw new Error("SQL.js asm.js script loaded but initSqlJs is unavailable.");
        }

        return patchDatabaseExec(await window.initSqlJs());
      } catch (error) {
        lastError = error;
        console.warn("SQL.js asm.js bootstrap failed.", scriptUrl, error);
      }
    }

    throw lastError || new Error("Unable to load sql-asm.js.");
  }

  async function proxyInitSqlJs(config) {
    if (!modulePromise) {
      modulePromise = (async () => {
        try {
          return await loadWasmModule(config);
        } catch (wasmError) {
          console.warn("Falling back to asm.js SQL engine.", wasmError);
        }

        return loadAsmModule();
      })().catch((error) => {
        modulePromise = null;
        throw error;
      });
    }

    return modulePromise;
  }

  proxyInitSqlJs[PROXY_MARKER] = true;
  window.initSqlJs = proxyInitSqlJs;
})();
