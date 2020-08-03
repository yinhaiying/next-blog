import Link from 'next/link';
import _ from 'lodash';

type Options = {
  page: number;
  totalPage: number;
  urlMaker?: (page: number) => string;
}
const defaultUrlMaker = (page: number) => `?page=${page}`
export const usePager = (options: Options) => {
  const { page, totalPage, urlMaker } = options;
  const _urlMaker = urlMaker || defaultUrlMaker;
  const numbers = [];

  numbers.push(1);           // 第一页
  // 添加当前页
  for (let i = page - 3; i <= page + 3; i++) {
    numbers.push(i);
  }

  numbers.push(totalPage);   // 最后一页
  // 去重，排序，去除负数
  const pageList = _.uniq(numbers).sort().filter((page) => page >= 1 && page <= totalPage);
  console.log('pageList:', pageList)
  // 添加... 当数字不连续的时候就可以添加...
  for (let i = 0; i < pageList.length; i++) {
    if (pageList[i] !== i + 1) {
      pageList.splice(i, 0, -1);
      i++;
    }
  }
  const pager = totalPage > 1 ? (
    <div className="wrapper">
      {
        page > 1 && <Link href={_urlMaker(page - 1)}>
          <a >上一页</a>
        </Link>
      }
      {pageList.map((n) => n === -1 ?
        <span key={n}>...</span>
        : <Link href={_urlMaker(n)} key={n}>
          <a >{n}</a></Link>
      )}
      {
        page < totalPage && <Link href={_urlMaker(page + 1)}>
          <a >下一页</a>
        </Link>
      }
      <span>第{page}/{totalPage}页</span>

      <style jsx>
        {
          `
          .wrapper{
            margin:0 -8px;
            padding: 20px 0;
            display:flex;
            justify-content:center;
            alignitems:center;
          }
          .wrapper > a,.wrapper > span{
            margin:0 8px;
          }
          a{
            color:#000;
          }
          a:hover{
            color:#00adb5;
          }

          `
        }
      </style>
    </div>
  ) : null;

  return {
    pager
  }

}
