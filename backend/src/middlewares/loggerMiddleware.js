export function requestLogger(req, _res, next) {
  const startedAt = Date.now();
  req.requestStartedAt = startedAt;
  const requestId = `${startedAt}-${Math.random().toString(36).slice(2, 8)}`;
  req.requestId = requestId;

  console.info(
    JSON.stringify({
      level: "info",
      event: "http_request_started",
      requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      at: new Date(startedAt).toISOString()
    })
  );

  _res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.info(
      JSON.stringify({
        level: "info",
        event: "http_request_completed",
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: _res.statusCode,
        durationMs
      })
    );
  });

  next();
}
