import { Injectable } from '@nestjs/common';
import * as handlebarsHelpers from 'handlebars-helpers';
import * as showdown from 'showdown';

const HELPERS: Array<string> = [
  'array',
  'collection',
  'comparison',
  'date',
  'html',
  'math',
  'misc',
  'number',
  'object',
  'regex',
  'string',
  'url',
  'markdown',
];

@Injectable()
export class HandlebarsService {

  private segment: string = '';
  public handlebars: any;

  constructor() {
    this.handlebars = require('handlebars').create();
    handlebarsHelpers(HELPERS, { handlebars: this.handlebars });

    this.handlebars.registerHelper('compare_length', function(
      arr,
      operator,
      val,
      opts,
    ) {
      let result = false;
      switch (operator) {
        case '==':
          result = arr.length == val;
          break;
        case '<':
          result = arr.length < val;
          break;
        case '>':
          result = arr.length > val;
          break;
        default:
          throw 'Unknown operator ' + operator;
      }

      if (result) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    });

    this.handlebars.registerHelper('escapeUrl', url => {
      if (!url || url.length < 1) {
        return '';
      }
      return encodeURIComponent(url);
    });

    this.handlebars.registerHelper('templateChooser', (
      context,
      addTemplateClassname,
    ) => {
      context = context instanceof Array ? context[0] : context;

      if (!context || !context._meta) {
        return '';
      }
      const parsedName = context._meta.schema
        .match(/(\/[\w\-]+)/g)
        .splice(-1)[0]
        .replace('/', '')
        .replace(/-([a-z])/g, g => g[1].toUpperCase());
      let matchedTemplate;
      for (const x in this.handlebars.partials) {
        if (parsedName.toLowerCase() === x.toLowerCase()) {
          matchedTemplate = this.handlebars.partials[x].length
            ? this.handlebars.partials[x]
            : this.handlebars.template(this.handlebars.partials[x]);
          break;
        }
      }

      if (!matchedTemplate) {
        return 'Template matching id: ' + parsedName + ' not found';
      }

      context.addTemplateClassname =
        typeof addTemplateClassname !== 'undefined'
          ? addTemplateClassname
          : '';
      return new this.handlebars.SafeString(matchedTemplate(context));
    });

    this.handlebars.registerHelper('dynamicTemplate', (
      id,
      renderTypes,
      context,
      addTemplateClassname,
    ) => {
      if (id === false) {
        id = context['@type'];
      }

      if (renderTypes) {
        context.renderTypes = renderTypes;
      } else {
        renderTypes = context.renderTypes;
      }

      const parsedId =
        id.indexOf('/') === -1
          ? id
          : id.substring(id.lastIndexOf('/') + 1, id.length);
      let matchedTemplate;
      for (const name in renderTypes) {
        if (parsedId === renderTypes[name]) {
          matchedTemplate = this.handlebars.partials[name].length
            ? this.handlebars.partials[name]
            : this.handlebars.template(this.handlebars.partials[name]);
          break;
        }
      }
      if (!matchedTemplate) {
        return 'Template matching id: ' + id + ' not found';
      }

      context.addTemplateClassname =
        typeof addTemplateClassname !== 'undefined'
          ? addTemplateClassname
          : '';
      return new this.handlebars.SafeString(matchedTemplate(context));
    });

    this.handlebars.registerHelper('math', (
      lvalue,
      operator,
      rvalue,
      options,
    ) => {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);

      return {
        '+': lvalue + rvalue,
        '-': lvalue - rvalue,
        '*': lvalue * rvalue,
        '/': lvalue / rvalue,
        '%': lvalue % rvalue,
      }[operator];
    });

    this.handlebars.registerHelper('bannerConfig', function(opts) {
      let style = '';
      let hex = this.bannerColor || '#fff';
      const alpha = this.bannerOpacity || 1;
      hex = hex.replace('#', '');

      if (hex.length === 3) {
        const hexArr = hex.split('');
        hex = hexArr[0] + hexArr[0];
        hex += hexArr[1] + hexArr[1];
        hex += hexArr[2] + hexArr[2];
      }

      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      if (alpha) {
        style +=
          'background-color:rgba(' +
          r +
          ', ' +
          g +
          ', ' +
          b +
          ', ' +
          alpha +
          '); ';
      } else {
        style += 'background-color:rgb(' + r + ', ' + g + ', ' + b + '); ';
      }

      if (this.textColour) {
        style += 'color: #' + this.textColour;
      }

      return style;
    });

    this.handlebars.registerHelper('roundelConfig', roundel => {
      if (
        roundel &&
        roundel[0] &&
        roundel[0].roundel &&
        roundel[0].roundel.name
      ) {
        const roundelParams = [];
        let imageRoundelIndex;
        for (let x = 0; x < roundel.length; x++) {
          let roundelParam = '';
          switch (roundel[x].roundelPosition) {
            case 'Bottom Right':
              roundelParam = 'p1_img=';
              imageRoundelIndex = 1;
              break;
            case 'Bottom Left':
              roundelParam = 'p2_img=';
              imageRoundelIndex = 2;
              break;
            case 'Top Left':
              roundelParam = 'p3_img=';
              imageRoundelIndex = 3;
              break;
            case 'Top Right':
              roundelParam = 'p4_img=';
              imageRoundelIndex = 4;
              break;
          }

          const roundelRatio = roundel[x].roundelRatio;
          roundelParam +=
            roundel[x].roundel.name +
            (roundelRatio
              ? '&roundelRatio' + imageRoundelIndex + '=' + roundelRatio
              : '');
          roundelParams.push(roundelParam);
        }

        return roundelParams.join('&');
      } else {
        return '';
      }
    });

    this.handlebars.registerHelper('splitBlock', (index, split) => {
      if (typeof split === 'undefined') {
        return '';
      }
      const id = parseInt(index, 10);
      const splitter = split.split('/');
      if (id === 0) {
        return 'amp-dc-size-' + splitter[0];
      }

      return 'amp-dc-size-' + splitter[1];
    });

    this.handlebars.registerHelper('iff', function(a, operator, b, opts) {
      let bool = false;
      switch (operator) {
        case '==':
          bool = a == b;
          break;
        case '>':
          bool = a > b;
          break;
        case '<':
          bool = a < b;
          break;
        default:
          throw new Error('Unknown operator ' + operator);
      }

      if (bool) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    });

    this.handlebars.registerHelper('roundelProperties', function(opts) {
      if (
        this.roundel &&
        this.roundel[0] &&
        this.roundel[0].roundel &&
        this.roundel[0].roundelPosition &&
        this.roundel[0].roundelRatio
      ) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    });

    this.handlebars.registerHelper('showdown', (text) => {
      if (typeof showdown === 'undefined') {
        return text || '';
      }
      const converter = new showdown.Converter({
        noHeaderId: true,
        simpleLineBreaks: true,
      });

      text = converter.makeHtml(text);

      if (typeof text === 'undefined') {
        text = '';
      }

      return new this.handlebars.SafeString(text);
    });

    this.handlebars.registerHelper('times', (n, block) => {
      let output = '';
      for (let i = 0; i < n; ++i) {
        output += block.fn(i);
      }
      return output;
    });

    this.handlebars.registerHelper('json', (obj) => {
      return JSON.stringify(obj);
    });

    this.handlebars.registerHelper('matchSegment', (context, block) => {
      context = context instanceof Array ? context[0] : context;

      if (!context || !context._meta || !context.segments) {
        return '';
      }
      let matchedSegment = context.segments[0];
      for (const segment of context.segments) {
        if (segment.segment === this.segment) {
          matchedSegment = segment;
        }
      }

      return block.fn(matchedSegment.content);
    });

    this.handlebars.registerHelper('slotName', (id) => {
      switch(id) {
        case '83599656-ba74-4c1e-8b4c-d647c4daa270':
          return 'Web / Mega Menu Promo';
        case '2eb20504-341e-4c5f-9f0f-13b0d59a5c1e':
          return 'Web / Homepage / Hero';
        case '786fdfe5-738b-436c-9af0-76a7f7696e98':
          return 'Web / Homepage / Content Stack';
        case 'c3568665-0fb5-4da5-891f-adc2e8af2779':
          return 'Web / Homepage / Footer Content Block';
        case '6e030093-714c-406d-85f1-b942cc93f3b4':
          return 'Web / Womens / Hero';
        case 'a8d7445c-f94a-43a6-a914-ff462922d192':
          return 'Web / Womens / Top Content Block';
        case '0f55d6f0-de04-4488-8385-91c52eb416b0':
          return 'Web / Womens / Bottom Content Block';
        case '39d245d8-46ff-4321-9528-82f45b6cfb01':
          return 'Web / Womens / Footer Content Block';
        case '45c3462b-1612-4a32-859a-bb844d36c276':
          return 'Web / Lookbook / Content';
        case '3bbe2f81-0429-409c-89d6-81c9fb3c093e':
          return 'Inspiration Landing Page Slot';
        case '057caea3-b3a1-4158-938e-7447eaf11153':
          return 'Web / Product / Content';
        case '4d382704-3a31-4792-8ebd-dae6ff400e0a':
          return 'Web / Product / Recommendations';
        case 'c5ac638d-52fc-4fcb-add4-839181d4519c':
          return 'Web / Blog';
        case 'f5889e7d-8c8c-4fb4-93a7-2cd826e70a17':
          return 'Ethical Beauty Blog Slot';
        default:
          return '';
      }
    });
  }

  public setSegment(segment: string) {
    this.segment = segment;
  }

  public registerPartial(name, template) {
    return this.handlebars.registerPartial(name, template);
  }

  public compile(template) {
    return this.handlebars.compile(template);
  }

  public getPartial(name: string) {
    return this.handlebars.partials[name];
  }

  public registerPartials(partials: any) {
    Object.keys(partials).forEach(x => {
      this.registerPartial(x, partials[x]);
    });
  }

}
