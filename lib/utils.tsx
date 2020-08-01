export const getParam = (url:string, param:string):string => {
  url = url || '';
  let regexp, result, val;
  regexp = new RegExp(`(\\?|&)${param}=([^&]*)`);
  result = regexp.exec(url);
  val = result && result[2] ? decodeURIComponent(result[2]) : null;
  return val;
}
