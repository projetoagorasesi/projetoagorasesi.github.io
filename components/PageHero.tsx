import { asset } from "@/lib/util"

export default function PageHero({
  selo,
  titulo,
  texto,
  imagem,
}: {
  selo: string
  titulo: string
  texto?: string
  imagem?: string
}) {
  return (
    <section className="relative pt-36 pb-20 overflow-hidden bg-gradient-to-br from-soil-brown via-soil-brown/90 to-aged-copper">
      {imagem && (
        <div className="absolute inset-0">
          <img src={asset(imagem)} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-soil-brown via-soil-brown/90 to-aged-copper/80"></div>
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="selo bg-aged-copper/20 border border-aged-copper/40 text-sand-beige mb-6">{selo}</span>
        <h1 className="font-poppins font-bold text-4xl md:text-6xl text-white mt-6 mb-6 text-balance">{titulo}</h1>
        {texto && <p className="text-lg md:text-xl text-sand-beige max-w-3xl mx-auto text-pretty">{texto}</p>}
      </div>
    </section>
  )
}
