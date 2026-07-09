// ===== Landing Page Indicador+ — Scripts =====

document.addEventListener("DOMContentLoaded", () => {
    // Animação de entrada da Hero no carregamento
    const hero = document.querySelector(".hero");

    if (hero) {
        // pequeno atraso para garantir a transição a partir do estado inicial
        requestAnimationFrame(() => {
            hero.classList.add("is-visivel");
        });
    }

    // ===== Hero — troca de frase (crossfade + blur) conforme o scroll =====
    // Desce → "Agora te trouxemos até aqui"; volta ao topo → "Você começou".
    const titulo = document.querySelector(".hero__titulo");
    const semMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (titulo) {
        const LIMIAR_DESCE = 60; // px de scroll para trocar p/ frase 2
        const LIMIAR_SOBE = 30;  // px para voltar p/ frase 1 (histerese)
        let emFase2 = false;
        let agendado = false;

        function atualizarFrase() {
            const y = window.scrollY || window.pageYOffset || 0;
            if (!emFase2 && y > LIMIAR_DESCE) {
                emFase2 = true;
                titulo.classList.add("fase-2");
            } else if (emFase2 && y < LIMIAR_SOBE) {
                emFase2 = false;
                titulo.classList.remove("fase-2"); // reverso ao subir
            }
            agendado = false;
        }

        window.addEventListener(
            "scroll",
            () => {
                if (!agendado) {
                    requestAnimationFrame(atualizarFrase);
                    agendado = true;
                }
            },
            { passive: true }
        );

        atualizarFrase(); // estado inicial (caso já carregue rolado)
    }

    // ===== Seção 2 — Barra de métricas (entrada + count-up) =====
    const barra = document.querySelector(".metricas__barra");

    if (barra) {
        const observador = new IntersectionObserver(
            (entradas, obs) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        barra.classList.add("is-visivel");
                        iniciarContagem(barra);
                        obs.unobserve(entrada.target);
                    }
                });
            },
            { threshold: 0.35 }
        );

        observador.observe(barra);
    }

    // ===== Reveal genérico ao entrar na viewport (seções 3–6) =====
    const reveals = document.querySelectorAll(
        ".reveal, .ecossistema__diagrama"
    );

    if (reveals.length) {
        const obsReveal = new IntersectionObserver(
            (entradas, obs) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("is-visivel");
                        obs.unobserve(entrada.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        // pequena defasagem escalonada entre irmãos .reveal
        reveals.forEach((el, i) => {
            el.style.transitionDelay = `${(i % 4) * 0.08}s`;
            obsReveal.observe(el);
        });
    }

    // ===== Seção 5 — Acordeão do FAQ (1 aberto por vez) =====
    const perguntas = document.querySelectorAll(".faq__pergunta");

    perguntas.forEach((botao) => {
        botao.addEventListener("click", () => {
            const aberto = botao.getAttribute("aria-expanded") === "true";

            // fecha todos
            perguntas.forEach((b) => {
                b.setAttribute("aria-expanded", "false");
                const resp = b.nextElementSibling;
                resp.style.maxHeight = null;
                resp.style.opacity = "0";
            });

            // abre o clicado (se estava fechado)
            if (!aberto) {
                botao.setAttribute("aria-expanded", "true");
                const resp = botao.nextElementSibling;
                resp.style.maxHeight = resp.scrollHeight + "px";
                resp.style.opacity = "1";
            }
        });
    });

    // ===== Rodapé — efeito parallax sutil ao entrar na viewport =====
    const rodape = document.querySelector(".rodape");
    const rodapeInner = document.querySelector(".rodape__inner");

    if (rodape && rodapeInner && !semMovimento) {
        const intensidade = 80; // deslocamento máximo em px
        let agendado = false;

        function atualizarParallax() {
            const rect = rodape.getBoundingClientRect();
            const vh = window.innerHeight;

            // progresso: 0 quando o topo do rodapé toca a base da tela
            // (rect.top === vh) e 1 quando o rodapé já entrou totalmente
            // (rect.top === vh - altura). Usa a própria altura como curso.
            const progresso = Math.min(
                Math.max((vh - rect.top) / rect.height, 0),
                1
            );

            // o conteúdo começa deslocado para baixo e "assenta" ao rolar
            const deslocamento = (1 - progresso) * intensidade;
            rodapeInner.style.transform = `translateY(${deslocamento}px)`;

            agendado = false;
        }

        window.addEventListener(
            "scroll",
            () => {
                if (!agendado) {
                    requestAnimationFrame(atualizarParallax);
                    agendado = true;
                }
            },
            { passive: true }
        );

        atualizarParallax();
    }

    // ===== Modal — formulário de contato (CTA final) =====
    // PLACEHOLDER: cole a URL do Web App do Google Apps Script (ver
    // arquivo google-apps-script.gs na raiz do projeto).
    const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw92buj8wQXQwkZZ6VD2RgOx4ICWr221XsYbkL7ERA1HS90av9vqrKA5_9DGiDkBgcc/exec";
    // PLACEHOLDER: número do WhatsApp (somente dígitos, com DDI+DDD).
    const WHATSAPP_NUMERO = "553788512990";

    const modal = document.getElementById("modal-lead");
    const botaoCta = document.querySelector(".cta__botao--primario");
    const formLead = document.getElementById("form-lead");

    if (modal && botaoCta && formLead) {
        function abrirModal(e) {
            if (e) e.preventDefault();
            modal.classList.add("is-aberto");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-ativo");
            // foco no primeiro campo
            const primeiro = modal.querySelector("input");
            if (primeiro) setTimeout(() => primeiro.focus(), 100);
        }

        function fecharModal() {
            modal.classList.remove("is-aberto");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-ativo");
        }

        // Abre ao clicar no botão do CTA final
        botaoCta.addEventListener("click", abrirModal);

        // Fecha: botão X, overlay e tecla ESC
        modal.querySelectorAll("[data-fechar-modal]").forEach((el) => {
            el.addEventListener("click", fecharModal);
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-aberto")) {
                fecharModal();
            }
        });

        // Envio do formulário → planilha + WhatsApp
        formLead.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!formLead.checkValidity()) {
                formLead.reportValidity();
                return;
            }

            const nome = document.getElementById("lead-nome").value.trim();
            const email = document.getElementById("lead-email").value.trim();
            const telefone = document.getElementById("lead-telefone").value.trim();

            const botaoEnviar = formLead.querySelector(".modal__enviar");
            const textoOriginal = botaoEnviar.textContent;
            botaoEnviar.disabled = true;
            botaoEnviar.textContent = "Enviando...";

            // Corpo em application/x-www-form-urlencoded — o Apps Script
            // lê esses campos via e.parameter (colunas A, B e C).
            const params = new URLSearchParams();
            params.append("nome", nome);       // coluna A
            params.append("email", email);     // coluna B
            params.append("telefone", telefone); // coluna C
            // o horário (coluna D) é gerado no Apps Script (servidor)

            // 1) sendBeacon: garante a entrega mesmo ao sair da página
            //    (não é cancelado pela navegação para o WhatsApp).
            let enviado = false;
            if (navigator.sendBeacon) {
                const blob = new Blob([params.toString()], {
                    type: "application/x-www-form-urlencoded;charset=UTF-8",
                });
                enviado = navigator.sendBeacon(SHEETS_WEBAPP_URL, blob);
            }

            // 2) Fallback: fetch com keepalive (também sobrevive à navegação)
            if (!enviado) {
                try {
                    await fetch(SHEETS_WEBAPP_URL, {
                        method: "POST",
                        body: params,
                        mode: "no-cors",
                        keepalive: true,
                    });
                } catch (err) {
                    console.error("Erro ao enviar para a planilha:", err);
                }
            }

            // Redireciona ao WhatsApp com mensagem pré-preenchida.
            // Pequeno atraso para o beacon sair antes da navegação.
            const mensagem = encodeURIComponent(
                `Olá! Meu nome é ${nome} e quero lucrar mais com o Indicador+.`
            );
            setTimeout(() => {
                window.location.href =
                    `https://wa.me/${WHATSAPP_NUMERO}?text=${mensagem}`;
                botaoEnviar.disabled = false;
                botaoEnviar.textContent = textoOriginal;
            }, 300);
        });
    }

    // ===== Link "Fale com a gente" (abaixo do FAQ) → abre o chatbot =====
    const linkChatFaq = document.querySelector(".faq__link-chat");

    if (linkChatFaq) {
        linkChatFaq.addEventListener("click", (e) => {
            e.preventDefault();
            abrirChat();
        });
    }

    // Aciona o toggle do widget n8n. Se ainda não montou, tenta de novo.
    function abrirChat(tentativas = 20) {
        const toggle =
            document.querySelector(".chat-window-toggle") ||
            document.querySelector("#n8n-chat .chat-window-toggle");
        const janelaAberta = document.querySelector(".chat-window");

        if (janelaAberta) return; // já está aberto

        if (toggle) {
            // dispara um clique real no botão do widget
            toggle.dispatchEvent(
                new MouseEvent("click", { bubbles: true, cancelable: true })
            );
        } else if (tentativas > 0) {
            // widget do chat ainda carregando (módulo do CDN)
            setTimeout(() => abrirChat(tentativas - 1), 300);
        } else {
            console.warn("Widget de chat (n8n) não encontrado na página.");
        }
    }
});

// Anima os números de 0 até o valor alvo mantendo prefixo/sufixo
function iniciarContagem(barra) {
    const valores = barra.querySelectorAll(".metrica__valor");
    const duracao = 1000; // ms

    valores.forEach((el) => {
        const alvo = parseInt(el.dataset.alvo, 10);
        const prefixo = el.dataset.prefixo || "";
        const sufixo = el.dataset.sufixo || "";
        let inicio = null;

        function passo(tempo) {
            if (inicio === null) inicio = tempo;
            const progresso = Math.min((tempo - inicio) / duracao, 1);
            // ease-out
            const eased = 1 - Math.pow(1 - progresso, 3);
            const atual = Math.round(eased * alvo);
            el.textContent = prefixo + atual + sufixo;

            if (progresso < 1) {
                requestAnimationFrame(passo);
            }
        }

        requestAnimationFrame(passo);
    });
}