"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageHero from "@/components/PageHero"
import { enviarMensagem, nuvemConfigurada } from "@/lib/nuvem"

export default function Contato() {
  const [form, setForm] = useState({ nome: "", email: "", assunto: "Dúvida sobre o projeto", mensagem: "", site: "" })
  const [estado, setEstado] = useState<"" | "enviando" | "ok" | "erro">("")

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (form.site) return // campo-armadilha contra robôs
    setEstado("enviando")
    try {
      await enviarMensagem({
        nome: form.nome.trim().slice(0, 120),
        email: form.email.trim().slice(0, 160),
        assunto: form.assunto,
        mensagem: form.mensagem.trim().slice(0, 4000),
      })
      setEstado("ok")
      setForm({ ...form, nome: "", email: "", mensagem: "" })
    } catch {
      setEstado("erro")
    }
  }

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="contato" />
      <PageHero
        selo="FALE CONOSCO"
        titulo="Fale com a equipe"
        texto="Dúvidas, sugestões, convites ou lembranças do bairro de Santo Antônio: sua mensagem chega direto para o grupo."
        imagem="/galeria/15_Rua_Conde_da_Boa_Vista_1930_Benicio_Dias.jpg"
      />
      <section className="py-20 bg-gradient-to-br from-sand-beige/40 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_1.4fr] gap-10">
          <div className="space-y-6">
            {[
              { i: "fa-camera-retro", t: "Tem fotos antigas do centro?", s: "Fotografias de família e documentos ajudam muito a pesquisa. Conte o que você tem." },
              { i: "fa-microphone", t: "Morou ou trabalhou no bairro?", s: "Lembranças de quem viveu Santo Antônio são fontes valiosas. Podemos conversar com você." },
              { i: "fa-chalkboard-user", t: "Quer nos convidar?", s: "Escolas, museus e eventos podem chamar a equipe para apresentar o projeto." },
            ].map((c) => (
              <div key={c.t} className="cartao p-6 flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-tech-teal/10 flex items-center justify-center">
                  <i className={`fas ${c.i} text-tech-teal text-xl`}></i>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-soil-brown mb-1">{c.t}</h3>
                  <p className="text-text-secondary text-sm">{c.s}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={enviar} className="cartao p-6 sm:p-10 space-y-5">
            <h2 className="font-poppins font-bold text-2xl text-soil-brown">Envie sua mensagem</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <label>
                <span className="rotulo">Nome</span>
                <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="campo" />
              </label>
              <label>
                <span className="rotulo">E-mail</span>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="campo" />
              </label>
            </div>
            <label className="block">
              <span className="rotulo">Assunto</span>
              <select value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} className="campo">
                <option>Dúvida sobre o projeto</option>
                <option>Tenho fotos ou documentos do bairro</option>
                <option>Quero contar uma lembrança</option>
                <option>Convite ou parceria</option>
                <option>Outro assunto</option>
              </select>
            </label>
            <label className="block">
              <span className="rotulo">Mensagem</span>
              <textarea required rows={6} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} className="campo resize-y" />
            </label>
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              className="hidden"
              aria-hidden="true"
            />
            <button type="submit" disabled={estado === "enviando" || !nuvemConfigurada()} className="btn-teal w-full sm:w-auto">
              {estado === "enviando" ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              Enviar mensagem
            </button>
            {!nuvemConfigurada() && <p className="text-sm text-text-muted">O formulário fica ativo quando o site for ligado à nuvem.</p>}
            {estado === "ok" && (
              <p className="text-success font-medium"><i className="fas fa-circle-check mr-2"></i>Mensagem enviada! Obrigado pelo contato.</p>
            )}
            {estado === "erro" && <p className="text-danger font-medium">Não foi possível enviar agora. Tente novamente em alguns minutos.</p>}
          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}
