import CodeBlock from "./CodeBlock.jsx";
import MarkdownText from "./MarkdownText.jsx";

function Bloc({ bloc }) {
  switch (bloc.type) {
    case "code":
      return <CodeBlock code={bloc.contenu} langage={bloc.langage || "plaintext"} />;
    case "etape":
      return (
        <div className="border-l-[3px] border-green pl-5 py-1 my-6">
          {bloc.titre && (
            <h4 className="font-syne font-bold text-ink text-base mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green text-white text-xs flex items-center justify-center shrink-0">✓</span>
              {bloc.titre}
            </h4>
          )}
          <MarkdownText text={bloc.contenu} className="text-gray-600 text-sm leading-relaxed block" />
        </div>
      );
    case "conseil":
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 my-4 flex gap-3">
          <span className="text-lg shrink-0">💡</span>
          <MarkdownText text={bloc.contenu} className="text-blue-800 text-sm leading-relaxed block" />
        </div>
      );
    case "avertissement":
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 my-4 flex gap-3">
          <span className="text-lg shrink-0">⚠️</span>
          <MarkdownText text={bloc.contenu} className="text-amber-800 text-sm leading-relaxed block" />
        </div>
      );
    default:
      return <MarkdownText text={bloc.contenu} className="text-gray-700 text-sm leading-relaxed my-3 block" />;
  }
}

function Section({ section, index }) {
  return (
    <div className="mb-10">
      {section.titre && (
        <h3 className="font-syne text-xl font-bold text-ink mb-4 flex items-center gap-3">
          <span className="font-mono text-xs text-green bg-green/10 border border-green/20 px-2.5 py-1 rounded-full">
            {String(index + 1).padStart(2, "0")}
          </span>
          {section.titre}
        </h3>
      )}
      {(section.blocs || []).map((b, i) => <Bloc key={i} bloc={b} />)}
    </div>
  );
}

export default function WorkshopContent({ contenu }) {
  if (!contenu?.sections?.length) return null;
  return (
    <div className="workshop-content prose-sm max-w-none">
      {contenu.sections.map((s, i) => <Section key={i} section={s} index={i} />)}
    </div>
  );
}
