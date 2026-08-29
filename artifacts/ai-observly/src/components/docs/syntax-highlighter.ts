export type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'punctuation' | 'property' | 'class' | 'function' | 'text';

export interface Token {
  type: TokenType;
  content: string;
}

const COMMON_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this', 'super', 'try', 'catch', 'finally', 'await', 'async', 'yield',
  'interface', 'type', 'implements', 'public', 'private', 'protected', 'readonly', 'as', 'any', 'unknown', 'never', 'null', 'undefined', 'true', 'false',
  'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'pass', 'break', 'continue', 'lambda', 'True', 'False', 'None'
]);

export function tokenize(code: string, language: string): Token[] {
  const lang = (language || '').toLowerCase();
  if (lang === 'xml' || lang === 'html') {
    return tokenizeXML(code);
  }
  if (lang === 'json') {
    return tokenizeJSON(code);
  }
  if (lang === 'yaml' || lang === 'yml') {
    return tokenizeYAML(code);
  }
  
  return tokenizeGeneric(code);
}

function tokenizeYAML(code: string): Token[] {
  const tokens: Token[] = [];
  const parts = code.split(/(\n)/);

  for (const part of parts) {
    if (part === '\n') {
      tokens.push({ type: 'text', content: part });
      continue;
    }

    const keyMatch = part.match(/^(\s*(?:-\s+)?)([A-Za-z0-9_.-]+)(:)/);
    let value = part;
    if (keyMatch) {
      if (keyMatch[1]) tokens.push({ type: 'text', content: keyMatch[1] });
      tokens.push({ type: 'property', content: keyMatch[2] });
      tokens.push({ type: 'punctuation', content: keyMatch[3] });
      value = part.slice(keyMatch[0].length);
    }
    tokens.push(...tokenizeYAMLValue(value));
  }

  return tokens;
}

function tokenizeYAMLValue(value: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < value.length) {
    const char = value[index];

    if (char === '#') {
      tokens.push({ type: 'comment', content: value.slice(index) });
      break;
    }

    if (char === "'" || char === '"') {
      const quote = char;
      let stop = index + 1;
      let escaped = false;
      while (stop < value.length) {
        const current = value[stop];
        const following = value[stop + 1];
        if (quote === "'" && current === "'" && following === "'") {
          stop += 2;
          continue;
        }
        if (!escaped && current === quote) {
          stop += 1;
          break;
        }
        escaped = quote === '"' && !escaped && current === '\\';
        if (current !== '\\') escaped = false;
        stop += 1;
      }
      tokens.push({ type: 'string', content: value.slice(index, stop) });
      index = stop;
      continue;
    }

    const keyword = value.slice(index).match(/^(?:true|false|null)\b/i);
    if (keyword) {
      tokens.push({ type: 'keyword', content: keyword[0] });
      index += keyword[0].length;
      continue;
    }

    const number = value.slice(index).match(/^-?\d+(?:\.\d+)?\b/);
    if (number) {
      tokens.push({ type: 'number', content: number[0] });
      index += number[0].length;
      continue;
    }

    let stop = index + 1;
    while (stop < value.length && !/['"#]/.test(value[stop])) {
      const remaining = value.slice(stop);
      if (/^(?:true|false|null)\b/i.test(remaining) || /^-?\d+(?:\.\d+)?\b/.test(remaining)) {
        break;
      }
      stop += 1;
    }
    tokens.push({ type: 'text', content: value.slice(index, stop) });
    index = stop;
  }

  return tokens;
}

function tokenizeJSON(code: string): Token[] {
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
  const tokens: Token[] = [];
  let lastIndex = 0;
  
  let match;
  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: code.slice(lastIndex, match.index) });
    }
    
    const val = match[0];
    if (val.match(/^".*"\s*:$/)) {
      tokens.push({ type: 'property', content: val });
    } else if (val.match(/^"/)) {
      tokens.push({ type: 'string', content: val });
    } else if (val.match(/true|false|null/)) {
      tokens.push({ type: 'keyword', content: val });
    } else {
      tokens.push({ type: 'number', content: val });
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < code.length) {
    tokens.push({ type: 'text', content: code.slice(lastIndex) });
  }
  
  return tokens;
}

function tokenizeXML(code: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z0-9:-]+)|(\s+[a-zA-Z0-9:-]+)(=)(['"].*?['"])|(>)|([^<]+)/g;
  
  let match;
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) tokens.push({ type: 'comment', content: match[1] });
    else if (match[2]) {
      tokens.push({ type: 'punctuation', content: match[2] });
    }
    else if (match[3]) {
      tokens.push({ type: 'class', content: match[3] });
    }
    else if (match[4]) {
      tokens.push({ type: 'property', content: match[4] });
      tokens.push({ type: 'operator', content: match[5] });
      tokens.push({ type: 'string', content: match[6] });
    }
    else if (match[7]) {
      tokens.push({ type: 'punctuation', content: match[7] });
    }
    else if (match[8]) {
      tokens.push({ type: 'text', content: match[8] });
    }
  }
  return tokens;
}

function tokenizeGeneric(code: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];

    if (char === '/' && next === '/') {
      const end = code.indexOf('\n', index);
      const stop = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', content: code.slice(index, stop) });
      index = stop;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = code.indexOf('*/', index + 2);
      const stop = end === -1 ? code.length : end + 2;
      tokens.push({ type: 'comment', content: code.slice(index, stop) });
      index = stop;
      continue;
    }

    if (char === '#') {
      const end = code.indexOf('\n', index);
      const stop = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', content: code.slice(index, stop) });
      index = stop;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      const quote = char;
      let stop = index + 1;
      let escaped = false;
      while (stop < code.length) {
        const current = code[stop];
        if (!escaped && current === quote) {
          stop += 1;
          break;
        }
        escaped = !escaped && current === '\\';
        if (current !== '\\') escaped = false;
        stop += 1;
      }
      tokens.push({ type: 'string', content: code.slice(index, stop) });
      index = stop;
      continue;
    }

    if (/\d/.test(char)) {
      const match = code.slice(index).match(/^\d+(?:\.\d+)?/);
      const content = match?.[0] ?? char;
      tokens.push({ type: 'number', content });
      index += content.length;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const match = code.slice(index).match(/^[A-Za-z_]\w*/);
      const word = match?.[0] ?? char;
      if (COMMON_KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', content: word });
      } else {
        const nextChars = code.slice(index + word.length).trimStart();
        if (nextChars.startsWith('(')) {
          tokens.push({ type: 'function', content: word });
        } else if (/^[A-Z]/.test(word) && word.toUpperCase() !== word) {
          tokens.push({ type: 'class', content: word });
        } else {
          tokens.push({ type: 'text', content: word });
        }
      }
      index += word.length;
      continue;
    }

    if (/[{}()[\].,;:?!+\-*/%<>=&|~^]/.test(char)) {
      let stop = index + 1;
      while (stop < code.length && /[{}()[\].,;:?!+\-*/%<>=&|~^]/.test(code[stop])) {
        stop += 1;
      }
      tokens.push({ type: 'operator', content: code.slice(index, stop) });
      index = stop;
      continue;
    }

    let stop = index + 1;
    while (
      stop < code.length &&
      !/[A-Za-z_0-9'"`#{}()[\].,;:?!+\-*/%<>=&|~^]/.test(code[stop])
    ) {
      stop += 1;
    }
    tokens.push({ type: 'text', content: code.slice(index, stop) });
    index = stop;
  }

  return tokens;
}
