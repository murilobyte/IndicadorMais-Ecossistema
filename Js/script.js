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

    // ===== Hero — máquina de escrever na 1ª tentativa de scroll =====
    const titulo = document.querySelector(".hero__titulo");
    const tituloTexto = document.querySelector(".hero__titulo-texto");
    const novoTexto = "Agora te trouxemos\naté aqui";
    const semMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let jaDisparou = false;

    function travarScroll() {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
    }
    function liberarScroll() {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }

    function digitar() {
        if (jaDisparou) return;
        jaDisparou = true;

        // Sem movimento: troca o texto na hora e libera o scroll
        if (semMovimento) {
            tituloTexto.textContent = novoTexto;
            liberarScroll();
            return;
        }

        titulo.classList.add("is-typing");

        const velApagar = 32; // ms por letra ao apagar
        const velDigitar = 60; // ms por letra ao escrever

        // 1) Apaga o texto atual, letra por letra
        function apagar() {
            const atual = tituloTexto.textContent;
            if (atual.length > 0) {
                tituloTexto.textContent = atual.slice(0, -1);
                setTimeout(apagar, velApagar);
            } else {
                setTimeout(escrever, 260); // pausa antes de reescrever
            }
        }

        // 2) Escreve o novo texto, letra por letra
        let i = 0;
        function escrever() {
            if (i <= novoTexto.length) {
                tituloTexto.textContent = novoTexto.slice(0, i);
                i++;
                setTimeout(escrever, velDigitar);
            } else {
                // Assim que a frase termina, LIBERA o scroll
                liberarScroll();
                setTimeout(() => titulo.classList.remove("is-typing"), 600);
            }
        }

        apagar();
    }

    // Segura o usuário na Hero até ele tentar rolar
    if (titulo && tituloTexto && !semMovimento) {
        travarScroll();
    }

    // Dispara na primeira intenção de rolar (roda, toque, teclado ou scroll)
    if (titulo && tituloTexto) {
        const aoRolar = () => digitar();
        window.addEventListener("wheel", aoRolar, { once: true, passive: true });
        window.addEventListener("touchmove", aoRolar, { once: true, passive: true });
        window.addEventListener("scroll", aoRolar, { once: true, passive: true });
        window.addEventListener(
            "keydown",
            (e) => {
                const teclas = ["ArrowDown", "PageDown", " ", "Spacebar", "End"];
                if (teclas.includes(e.key)) digitar();
            },
            { once: true }
        );
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