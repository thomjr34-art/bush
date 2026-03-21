export default function Parcours() {
  const parcours = [
    { titre: "Fondements", desc: "Logique, électronique, architecture CPU", etapes: ["Logique booléenne","Portes logiques","Architecture CPU","Assembleur"], couleur: "border-green" },
    { titre: "Algorithmique", desc: "Des bases à l'optimisation", etapes: ["Complexité Big-O","Tris fondamentaux","Arbres & graphes","Prog. dynamique"], couleur: "border-yellow" },
    { titre: "Systèmes", desc: "OS, mémoire, processus", etapes: ["Gestion mémoire","Processus & threads","Syscalls","Écrire un shell"], couleur: "border-red" },
    { titre: "Compilation", desc: "Du code source à l'exécutable", etapes: ["Lexer","Parser","AST","Génération de code"], couleur: "border-blue-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-syne font-extrabold text-3xl text-ink mb-2">Parcours</h1>
      <p className="text-gray-500 mb-8">Des chemins d'apprentissage structurés, du bas niveau vers le haut.</p>

      <div className="grid md:grid-cols-2 gap-5">
        {parcours.map(p => (
          <div key={p.titre} className={`bg-white rounded-2xl border-l-4 ${p.couleur} border-t border-r border-b border-gray-100 p-6`}>
            <h2 className="font-syne font-bold text-lg text-ink mb-1">{p.titre}</h2>
            <p className="text-gray-400 text-sm mb-4">{p.desc}</p>
            <div className="space-y-2">
              {p.etapes.map((e, i) => (
                <div key={e} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center font-mono shrink-0">
                    {i+1}
                  </span>
                  <span className="text-gray-600">{e}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
