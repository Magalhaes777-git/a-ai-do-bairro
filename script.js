const campoTarefa = document.getElementById("campo-tarefa");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaTarefas = document.getElementById("lista-tarefas");
const contadorTarefas = document.getElementById("contador-tarefas");
const botaoTema = document.getElementById("botao-alterar-tema");

let tarefas = [];

function adicionarTarefa() {
    const texto = campoTarefa.value.trim();

    if (texto === "") {
        alert("Digite uma tarefa!");
        return;
    }

    const tarefa = {
        nome: texto,
        concluida: false
    };

    tarefas.push(tarefa);
    campoTarefa.value = "";

    mostrarTarefas();
}

function mostrarTarefas() {
    listaTarefas.innerHTML = "";

    tarefas.forEach((tarefa, indice) => {
        const item = document.createElement("li");
        item.className = "item-tarefa";

        const texto = document.createElement("span");
        texto.textContent = tarefa.nome;

        if (tarefa.concluida) {
            texto.classList.add("concluida");
        }

        const botoes = document.createElement("div");
        botoes.className = "botoes-tarefa";

        const botaoConcluir = document.createElement("button");
        botaoConcluir.innerHTML = '<i class="fa-solid fa-check"></i>';
        botaoConcluir.className = "botao-concluir";
        botaoConcluir.title = "Concluir tarefa";

        botaoConcluir.addEventListener("click", function() {
            tarefas[indice].concluida = !tarefas[indice].concluida;
            mostrarTarefas();
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
        botaoExcluir.className = "botao-excluir";
        botaoExcluir.title = "Excluir tarefa";

        botaoExcluir.addEventListener("click", function() {
            tarefas.splice(indice, 1);
            mostrarTarefas();
        });

        botoes.appendChild(botaoConcluir);
        botoes.appendChild(botaoExcluir);

        item.appendChild(texto);
        item.appendChild(botoes);

        listaTarefas.appendChild(item);
    });

    contadorTarefas.textContent =
        tarefas.length + (tarefas.length === 1
            ? " tarefa na lista"
            : " tarefas na lista");
}

botaoAdicionar.addEventListener("click", adicionarTarefa);

campoTarefa.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        adicionarTarefa();
    }
});

botaoTema.addEventListener("click", function() {
    document.body.classList.toggle("tema-escuro");

    const icone = botaoTema.querySelector("i");

    if (document.body.classList.contains("tema-escuro")) {
        icone.className = "fa-solid fa-sun";
    } else {
        icone.className = "fa-solid fa-moon";
    }
});
