import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-soil-brown text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-landmark text-aged-copper text-2xl"></i>
              <span className="font-poppins font-bold text-2xl">ÁGORA</span>
            </div>
            <p className="text-sand-beige text-sm leading-relaxed">
              Projeto de iniciação científica da Escola SESI Ibura, com pesquisas sobre a história e o patrimônio do Recife.
            </p>
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Pesquisa</h4>
            <ul className="space-y-2 text-sand-beige text-sm">
              <li><Link href="/pesquisas/" className="hover:text-aged-copper transition-colors">Nossas pesquisas</Link></li>
              <li><Link href="/artigos/" className="hover:text-aged-copper transition-colors">Nossos artigos</Link></li>
              <li><Link href="/referencias/" className="hover:text-aged-copper transition-colors">Referências</Link></li>
              <li><Link href="/galeria/" className="hover:text-aged-copper transition-colors">Galeria de imagens</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">O grupo</h4>
            <ul className="space-y-2 text-sand-beige text-sm">
              <li><Link href="/diario/" className="hover:text-aged-copper transition-colors">Diário de ações</Link></li>
              <li><Link href="/integrantes/" className="hover:text-aged-copper transition-colors">Integrantes</Link></li>
              <li><Link href="/contato/" className="hover:text-aged-copper transition-colors">Fale conosco</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Escola</h4>
            <ul className="space-y-2 text-sand-beige text-sm">
              <li className="flex gap-2"><i className="fas fa-school mt-1 text-aged-copper"></i>Escola SESI Ibura · Rede SESI Pernambuco</li>
              <li className="flex gap-2"><i className="fas fa-flask mt-1 text-aged-copper"></i>Programa ÁGORA</li>
              <li className="flex gap-2"><i className="fas fa-road mt-1 text-aged-copper"></i>SESI Ciência na Rua 2026</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-sand-beige text-sm space-y-2">
          <p>© 2026 Projeto Ágora · Escola SESI Ibura. Textos da equipe; imagens com créditos aos autores e acervos.</p>
          <p><Link href="/painel/" className="text-sand-beige/60 hover:text-aged-copper text-xs"><i className="fas fa-lock mr-1"></i>Área da equipe</Link></p>
        </div>
      </div>
    </footer>
  )
}
