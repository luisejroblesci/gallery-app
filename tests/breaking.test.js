describe('Breaking change', () => {
  test('intentionally fails to trigger pipeline failure', () => {
    expect(true).toBe(false);
  });
});
