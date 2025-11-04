const cluster = require("cluster");
const os = require("os");
const express = require("express");
const { performance } = require("perf_hooks");
const path = require("path");

const numCPUs = os.cpus().length;
const PORT = 3000;

function randMatrix(n, min = 0, max = 1) {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => Math.random() * (max - min) + min)
  );
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

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  console.log(`Starting ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  const app = express();

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  app.get("/multiply", (req, res) => {
    const n = Math.floor(Math.random() * (2048 - 512 + 1)) + 512;
    const A = randMatrix(n);
    const B = randMatrix(n);
    const t0 = performance.now();
    const C = multiply(A, B, n);
    const t1 = performance.now();

    let preview = "";
    const limit = Math.min(6, n);
    for (let i = 0; i < limit; i++) {
      preview += C[i].slice(0, limit).map(v => v.toFixed(3)).join("\t") + "\n";
    }

    res.json({ n, time: t1 - t0, worker: process.pid, preview });
  });

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
}
