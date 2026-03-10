module.exports = {
  apps: [
    {
      name: "InsideDictionary",
      script: "npm",
      args: "start",
      cwd: "/srv/InsideDictionary",

      instances: "max",
      exec_mode: "cluster",

      out_file: "/srv/logs/InsideDictionary/console.log",
      error_file: "/srv/logs/InsideDictionary/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
