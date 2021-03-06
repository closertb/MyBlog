import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import QueryWithLoading from 'components/QueryWithLoading';
import { DateFormat } from 'configs/utils';
import { sql } from './sql';
import style from './index.less';

const marked = window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && window.hljs.getLanguage(lang)) {
      try {
        return window.hljs.highlight(lang, str).value;
      } catch (__) {
        return str;
      }
    }

    return str; // use external default escaping
  }
});

function RelateLink({ data, className }) {
  const { edges = [] } = data;
  if (edges.length === 0) {
    return null;
  }
  const { cursor, node: { title, url } } = edges[0];
  return (<Link className={className} to={`/blog/${url.replace(/.*issues\//, '')}?cursor=${cursor}`}>{title}</Link>);
}
export default function BlogDetail({ location: { pathname, search = '' } }) {
  const number = pathname.replace('/blog/', '');
  if (typeof number !== 'string' && typeof +number !== 'number') {
    return <div className="content-waring">路径无效</div>;
  }
  // 提取cursor
  const cursor = search ?
    search.slice(1).split('&').find(item => item.includes('cursor=')).replace('cursor=', '') :
    undefined;

  const param = { number: +number, cursor };

  const callback = useCallback((e) => {
    const href = (e.target && e.target.href) || '';
    if (href.includes('closertb.github.io/issues/')) {
      e.preventDefault();
      window.location.href = `/#/blog/${href.split('/').pop()}`;
    }
  });
  useEffect(() => {
    document.addEventListener('click', callback);
    return () => {
      document.removeEventListener('click', callback);
    };
  }, []);
  // const { loading, error, data = {} } = useQuery(query({ number }));
  return (
    <QueryWithLoading sql={sql} query={param} path={pathname}>
      {({ repository: { issue: { title, url, body, updatedAt }, last = {}, next = {} } }) => (
        <div className={style.Detail}>
          <div className="header">
            <h3 className="title">{title}</h3>
            <div className="info">
              <a href={url} target="_blank" rel="noopener noreferrer">Issue链接</a>
              <span>更新于：{DateFormat(updatedAt)}</span>
            </div>
          </div>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked.render(body) }} />
          <div className="page-jump">
            <RelateLink data={last} className="last" />
            <RelateLink data={next} className="next" />
          </div>
        </div>
      )}
    </QueryWithLoading>
  );
}
