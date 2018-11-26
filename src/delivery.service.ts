import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

export interface Meta {
  schema: string;
  name?: string;
}

export interface GraphItem {
  _meta: Meta;
  '@type': string;
  '@id': string;
}

export type GraphResult = object & {
  '@id': string;
  [index: string]: any;
};

export interface ContentGraph {
  '@context': string;
  '@type': 'QueryResult';
  result: Array<GraphResult>;
  '@graph': Array<GraphItem>;
}

@Injectable()
export class DeliveryService {

  constructor(private baseUrl: string, private readonly account: string, private locale?: string) {
    this.setBaseUrl(baseUrl);
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (this.baseUrl.indexOf('://') === -1) {
      this.baseUrl = 'http://' + this.baseUrl;
    }
  }

  setLocale(locale: string) {
    this.locale = locale;
  }

  async getByIds(ids: Array<string>): Promise<Array<GraphItem>> {
    return this.query({
      'sys.iri': {
        $in: ids.map(id => 'http://content.cms.amplience.com/' + id),
      },
    });
  }

  async getById(id: string): Promise<GraphItem> {
    const graph = await this.query({ 'sys.iri': 'http://content.cms.amplience.com/' + id });
    return graph[0];
  }

  async query(
    query: object,
    scope: string = 'tree',
    fullBodyObject: boolean = true,
  ): Promise<Array<GraphItem>> {
    if (scope === undefined) {
      scope = 'tree';
    }
    if (fullBodyObject === undefined) {
      fullBodyObject = true;
    }
    let url = this.baseUrl + '/cms/content/query' +
      '?query=' + encodeURIComponent(JSON.stringify(query)) +
      '&store=' + encodeURIComponent(this.account) +
      '&scope=' + encodeURIComponent(scope) +
      '&fullBodyObject=' + encodeURIComponent(String(fullBodyObject));
    if (this.locale) {
      url += '&locale=' + encodeURIComponent(this.locale);
    }

    url += '&timestamp=' + new Date().getTime();

    let retryCount = 0;
    function retryFetch(): Promise<ContentGraph> {
      return fetch(url, { timeout: 30000 })
          .then(res => res.json())
          .catch(err => {
            if(retryCount++ < 3) {
              return retryFetch();
            }
          });
    }

    const graph :ContentGraph = await retryFetch();

    return this.inlineContent(graph);
  }

  private inlineContent(delivery: ContentGraph): Array<GraphItem> {
    const contentKeyMap: any = {};
    if (delivery) {
      for (const content of delivery['@graph']) {
        contentKeyMap[content['@id']] = content;
      }
      return delivery.result
        .filter(x => x['@id'])
        .map(x => this.inlineChildContent(
          { '@id': x['@id'] },
          contentKeyMap as { [key: string]: GraphItem },
        ));
    }
    return [];
  }

  private inlineChildContent(parentNode: GraphResult, contentKeyMap: { [key: string]: GraphItem }): GraphItem {
    Object.assign(parentNode, contentKeyMap[parentNode['@id']] || {});
    for (const [key, value] of Object.entries(parentNode)) {
      if (value !== null && typeof value === 'object') {
        parentNode[key] = this.inlineChildContent(parentNode[key], contentKeyMap);
      } else if (Array.isArray(value)) {
        parentNode[key] = value.map(x => this.inlineChildContent(x, contentKeyMap));
      }
    }
    return parentNode as GraphItem;
  }
}
