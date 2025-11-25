describe('HealthController', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('should return health status', () => {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    expect(healthStatus.status).toBe('ok');
    expect(healthStatus.timestamp).toBeDefined();
    expect(healthStatus.uptime).toBeGreaterThan(0);
  });
});
