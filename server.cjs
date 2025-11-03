const express = require("express");
const { performance } = require("perf_hooks");
const path = require("path");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function randMatrix(n, min = 0, max = 1) {
  const M = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => Math.random() * (max - min) + min)
  );
  return M;
}

function multiply(A, B, n) {
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const aik = A[i][k];
      for (let j = 0; j < n; j++) {
        C[i][j] += aik * B[k][j];
      }
    }
  }
  return C;
}

app.get("/multiply", (req, res) => {
  const n = Math.floor(Math.random() * (2048 - 512 + 1)) + 512;
  const A = randMatrix(n);
  const B = randMatrix(n);
  const t0 = performance.now();
  const C = multiply(A, B, n);
  const t1 = performance.now();

  // Build a small preview of top-left 6×6
  let preview = "";
  const limit = Math.min(6, n);
  for (let i = 0; i < limit; i++) {
    preview += C[i].slice(0, limit).map(v => v.toFixed(3)).join("\t") + "\n";
  }

  res.json({ n, time: t1 - t0, preview });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
