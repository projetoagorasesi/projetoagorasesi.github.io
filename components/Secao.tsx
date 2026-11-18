export function Selo({ children, cor = "teal" }: { children: React.ReactNode; cor?: "teal" | "copper" }) {
  return (
    <div
      className={`selo mb-6 ${cor === "teal" ? "bg-tech-teal/10 text-tech-teal" : "bg-aged-copper/10 text-aged-copper"}`}
    >
      {children}
    </div>
  )
}

export function Vazio({ icone, texto }: { icone: string; texto: string }) {
  return (
    <div className="cartao p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sand-beige/60 flex items-center justify-center">
        <i className={`fas ${icone} text-aged-copper text-2xl`}></i>
      </div>
      <p className="text-text-secondary">{texto}</p>
    </div>
  )
}
