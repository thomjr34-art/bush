// Sous-composant pour le formatage inline (gras, italique, surligné, code)
function InlineText({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[\s\S]*?\*\*|==[\s\S]*?==|\*[\s\S]*?\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 3) {
          return (
            <code key={index} className="bg-gray-100 text-pink-600 font-mono text-[0.85em] px-1.5 py-0.5 rounded mx-0.5 border border-gray-200">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("==") && part.endsWith("==") && part.length >= 4) {
          return (
            <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded mx-0.5">{part.slice(2, -2)}</mark>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
          return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}

// Sous-composant pour afficher un tableau
function TableBlock({ lines }) {
  const rows = lines.map(line => line.trim().replace(/^\||\|$/g, '').split('|'));
  if (rows.length < 2) return <div className="whitespace-pre-wrap">{lines.join('\n')}</div>;

  const header = rows[0];
  const body = rows.slice(2); // On saute la ligne de séparation |---|

  return (
    <div className="overflow-x-auto my-4 border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                <InlineText text={cell.trim()} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {body.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-700 border-r border-gray-200 last:border-r-0">
                  <InlineText text={cell ? cell.trim() : ''} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownText({ text, className = "" }) {
  if (!text) return null;

  // Découpage intelligent : on repère les blocs de tableaux
  const blocks = [];
  let currentBlock = [];
  let inTable = false;

  text.split('\n').forEach((line) => {
    const isTableLine = line.trim().startsWith('|') && (line.includes('|') || line.trim() === '|');
    
    if (isTableLine !== inTable) {
      if (currentBlock.length > 0) blocks.push({ type: inTable ? 'table' : 'text', content: currentBlock });
      currentBlock = [];
      inTable = isTableLine;
    }
    currentBlock.push(line);
  });
  if (currentBlock.length > 0) blocks.push({ type: inTable ? 'table' : 'text', content: currentBlock });

  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      {blocks.map((block, i) => (
        block.type === 'table' 
          ? <TableBlock key={i} lines={block.content} />
          : <div key={i} className="whitespace-pre-wrap mb-2 last:mb-0"><InlineText text={block.content.join('\n')} /></div>
      ))}
    </div>
  );
}