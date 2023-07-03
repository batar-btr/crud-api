export const checkUrl = (url:string) => {
  const [, first, second] = url.split('/');
  return !!(first === 'api' && second === 'users');
}
