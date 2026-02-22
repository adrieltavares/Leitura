// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2aiDvzYoNYwqWWCQtj9ZtNVz1808l2ek",
  authDomain: "leitura-e62b3.firebaseapp.com",
  projectId: "leitura-e62b3",
  storageBucket: "leitura-e62b3.firebasestorage.app",
  messagingSenderId: "227769996951",
  appId: "1:227769996951:web:626bebb9ba8da56c6efbd2",
  measurementId: "G-NL5SYPJ6C8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Função para criar uma nova leitura no Firestore
async function criarLeitura(titulo, autor, paginasTotais) {
  try {
    await addDoc(colecaoLeituras, {
      titulo,
      autor,
      paginasTotais,
      paginasLidas: 0,
      criadoEm: new Date(),
    });
    console.log("Leitura salva com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar leitura:", erro);
    alert("Erro ao salvar leitura. Veja o console para mais detalhes.");
  }
}

// Listener do formulário
form.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // evita recarregar a página

  const titulo = document.getElementById("titulo").value.trim();
  const autor = document.getElementById("autor").value.trim();
  const paginasTotaisValor = document.getElementById("paginasTotais").value;
  const paginasTotais = paginasTotaisValor ? Number(paginasTotaisValor) : null;

  if (!titulo) {
    alert("Informe pelo menos o título.");
    return;
  }

  await criarLeitura(titulo, autor, paginasTotais);

  form.reset();           // limpa o formulário
  await carregarLeituras(); // atualiza a lista
});

// Função para carregar e exibir as leituras
async function carregarLeituras() {
  listaDiv.innerHTML = "<p>Carregando leituras...</p>";

  try {
    const snapshot = await getDocs(colecaoLeituras);

    if (snapshot.empty) {
      listaDiv.innerHTML = "<p>Nenhuma leitura cadastrada ainda.</p>";
      return;
    }

    let html = "";

    snapshot.forEach((docSnap) => {
      const dados = docSnap.data();
      const id = docSnap.id;

      html += `
        <div data-id="${id}" style="margin-bottom: 12px;">
          <strong>${dados.titulo}</strong> 
          ${dados.autor ? `- ${dados.autor}` : ""}
          <br />
          Páginas: ${dados.paginasLidas || 0} / ${dados.paginasTotais || "?"}
          <br />
          <button class="btn-mais">+10 páginas</button>
          <button class="btn-excluir">Excluir</button>
          <hr />
        </div>
      `;
    });

    listaDiv.innerHTML = html;

    // Adicionar eventos aos botões depois de injetar o HTML
    adicionarEventosBotoes();
  } catch (erro) {
    console.error("Erro ao carregar leituras:", erro);
    listaDiv.innerHTML = "<p>Erro ao carregar leituras.</p>";
  }
}

// Chamar ao abrir a página
carregarLeituras();

// Função para adicionar eventos aos botões criados dinamicamente
function adicionarEventosBotoes() {
  const botoesMais = document.querySelectorAll(".btn-mais");
  const botoesExcluir = document.querySelectorAll(".btn-excluir");

  botoesMais.forEach((botao) => {
    botao.addEventListener("click", async (evento) => {
      const div = evento.target.closest("div[data-id]");
      const id = div.getAttribute("data-id");
      await incrementarLeitura(id, 10);
    });
  });

  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", async (evento) => {
      const div = evento.target.closest("div[data-id]");
      const id = div.getAttribute("data-id");
      const confirmar = confirm("Tem certeza que deseja excluir esta leitura?");
      if (confirmar) {
        await excluirLeitura(id);
      }
    });
  });
}

// Atualizar (U) - incrementar páginas lidas
async function incrementarLeitura(id, incremento) {
  const ref = doc(db, "leituras", id);

  try {
    // Primeiro pegar o documento atual
    const snapshot = await getDocs(colecaoLeituras);
    let paginasAtuais = 0;

    snapshot.forEach((docSnap) => {
      if (docSnap.id === id) {
        paginasAtuais = docSnap.data().paginasLidas || 0;
      }
    });

    await updateDoc(ref, {
      paginasLidas: paginasAtuais + incremento,
    });

    await carregarLeituras();
  } catch (erro) {
    console.error("Erro ao atualizar leitura:", erro);
  }
}

// Deletar (D)
async function excluirLeitura(id) {
  const ref = doc(db, "leituras", id);

  try {
    await deleteDoc(ref);
    await carregarLeituras();
  } catch (erro) {
    console.error("Erro ao excluir leitura:", erro);
  }
}


