const SILENCE = 0;
const basicSounds = [`${SILENCE}`, 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'/*, 'C5'*/];
const synth = new Tone.Synth().toDestination();
const duration = '.1n'
const noiseSynth = new Tone.NoiseSynth().toDestination();
const QUANTIDADE_MINIMA_DE_SONS = 5;
const QUANTIDADE_MAXIMA_DE_SONS = 100;
const BPM_PADRAO = 40;
const QUANTIDADE_MINIMA_BPM = 10;

var sounds = [];
var sequenciaResposta = [];
var qntSons = 0;
var reset = true;

function DBG(...args) {
  // console.log(...args)
}

function geraCombinacao(arr, qnt, incluirSilencio, iniciaEmUm, incluirSaltos) {
  let combinacao = [];
  DBG("arr =", arr);
  DBG("qnt =", qnt);
  DBG("incluirSilencio =", incluirSilencio);
  DBG("iniciaEmUm =", iniciaEmUm);
  DBG("incluirSaltos =", incluirSaltos);

  let lastArrValue = arr[arr.length-1];
  
  while(combinacao.length < qnt) {
    if(combinacao.length == 0) {
      if (iniciaEmUm)
        combinacao.push(1)
      else
        combinacao.push(arr[rando(arr[0],arr.length-1)]);
    }
    else {
      let lastNumberPushed = combinacao[combinacao.length-1];
      DBG('arr[length-1]=', lastArrValue)

      let jaIncluiuValorMaximo = combinacao.includes(lastArrValue)
      DBG("jaIncluiuValorMaximo=", jaIncluiuValorMaximo)

      if(!jaIncluiuValorMaximo) { //forçando continuar subindo
        combinacao.push(lastNumberPushed+1)
        continue;
      }

      if(incluirSaltos) {
        let randomCoin = rando(0,3); //1/3 de probabilidade?
        if(randomCoin == 1) {
          if(lastNumberPushed == 1)
            combinacao.push(lastArrValue);
          else if(lastNumberPushed == lastArrValue)
            combinacao.push(1);
          continue;
        }
      }

      let randomNumber = rando(-1,1)
      let diff = lastNumberPushed + randomNumber;
      DBG("diff = ", diff)

      if(diff > 0 && diff <= lastArrValue)
        combinacao.push(diff)
    }
  } //end while

  if(incluirSilencio) {
    for (let i = 1; i < combinacao.length; i++) { //por enquanto pulando o primeiro índice
      let randomCoin = rando(0,3);
      if(randomCoin == 1) {
        // combinacao[i] = SILENCE;
        combinacao.splice(i, 0, SILENCE);
        combinacao.pop()
      }
    }
  }
  DBG("combinacao=", combinacao);
  reset = false;
  return combinacao;
}

function geraSequencia(qntTons, incluirSilencio, iniciaEmUm, incluirSaltos) {
  if(qntTons >= basicSounds.length)
    qntTons = basicSounds.length-1

  DBG("qntTons=", qntTons);
  DBG("incluirSilencio=", incluirSilencio);
  DBG("incluirSaltos=", incluirSaltos);

  if(!sequenciaResposta || sequenciaResposta.length == 0) {
    DBG("qntSons=", qntSons);

    let seqIndex = [...Array(qntTons).keys()].map(x => ++x) //will be [1,2,3,4...qntTons]

    DBG("seqIndex=", seqIndex);

    let sequenciaAleatoria = geraCombinacao(seqIndex, qntSons, incluirSilencio, iniciaEmUm, incluirSaltos);
    DBG("sequenciaAleatoria=", sequenciaAleatoria);

    for (var i = 0; i < sequenciaAleatoria.length; i++) {
      sounds.push(basicSounds[sequenciaAleatoria[i]])
    }
    sequenciaResposta = [...sequenciaAleatoria];
    DBG('sounds=', sounds);
  }
}

function cria() {
  let localSounds = [...sounds];
  localSounds.push('END')

  let sequenciaBPM = new Tone.Sequence((time, note) => {
    if(note != 'END') {
      noiseSynth.triggerAttackRelease();
    }
    else {
      let sequenciaNotas = new Tone.Sequence((time, note) => {
        if(note != 'END'){
          synth.triggerAttackRelease(note, duration, time);
          noiseSynth.triggerAttackRelease();
        }
      }, localSounds).start();
      sequenciaNotas.loop = 1;
    }
  }, [1,2,3,4,'END']/*localSounds*/).start();
  sequenciaBPM.loop = 1;

}

function tocarSequencia(qntTons) { //do not consider silence
  DBG("IN tocarSequencia")

  if(qntTons >= basicSounds.length)
    qntTons = basicSounds.length-1;

  let seqIndex = [...Array(qntTons).keys()].map(x => ++x); //will be [1,2,3,4...qntTons]
  DBG('seqIndex=', seqIndex)
  let sequencia = [] //will be ['C4', 'D4', 'E4'...qntTons]

  for(const n of seqIndex) {
    DBG('n=', n)
    sequencia.push(basicSounds[n])
  }

DBG('sequencia=', sequencia)

  let sequenciaNotas = new Tone.Sequence((time, note) => {
      synth.triggerAttackRelease(note, duration, time);
    }, sequencia).start();
  sequenciaNotas.loop = 0;
  
  DBG("OUT tocarSequencia")
}

window.onload = function () {
    document.getElementById('resposta-button').addEventListener('click', () => {
      if(!sequenciaResposta || sequenciaResposta.length == 0)
        document.getElementById("resposta-text").innerHTML = 'Aperte o botão <b>Tocar sequência</b> antes';
      else
        document.getElementById("resposta-text").innerHTML = sequenciaResposta
    })

    document.getElementById('reset-button').addEventListener('click', () => {
      sequenciaResposta = [];
      sounds = [];
      document.getElementById("resposta-text").innerHTML = 'Aperte o botão <b>Tocar sequência</b> antes';
      DBG("sequencia apagada!")
    })

    document.getElementById('padrao-button').addEventListener('click', async () => {
      let qntTons = document.getElementById('inputQntTons').value * 1 || 7; //to int
      if(qntTons == undefined || typeof qntTons != 'number' || qntTons <= 0) {
        DBG("Quantidade de tons inserida incorretamente");
        alert("Defina Quantos graus maiores");
        return;
      }

      if(Tone.Transport.state == "started") {
        Tone.Transport.stop()
        Tone.Transport.cancel()
      }

      let bpm = document.getElementById('inputBPM').value * 1;
      DBG("bpm==", bpm)
      if(bpm <= QUANTIDADE_MINIMA_BPM)
        bpm = BPM_PADRAO;

      Tone.Transport.bpm.value = bpm;
      
      await Tone.start();
      Tone.Transport.start();
      
      tocarSequencia(qntTons);
    })

    document.getElementById('play-button').addEventListener('click', async () => {
      let qntTons = document.getElementById('inputQntTons').value * 1; //to int

      if(qntTons == undefined || typeof qntTons != 'number' || qntTons <= 0) {
        alert("Quantidade de tons inserida incorretamente");
        DBG("Defina Quantos graus maiores");
        return;
      }

      let bpm = document.getElementById('inputBPM').value * 1;
      DBG("bpm==", bpm)
      if(bpm <= QUANTIDADE_MINIMA_BPM)
        bpm = BPM_PADRAO;

      qntSons = document.getElementById('inputQntSons').value * 1; //to int
      if(qntSons == undefined || typeof qntSons != 'number' || qntSons <= 0) {
        alert("Quantidade de sons inserida incorretamente");
        DBG("Defina quantos sons");
        return;
      }

      if(qntSons > QUANTIDADE_MAXIMA_DE_SONS)
        qntSons = QUANTIDADE_MAXIMA_DE_SONS;

      let quantidadeAleatoria = document.getElementById("inputQntSonsAleatorios").checked;

      let incluirSilencio = document.getElementById("inputIncluirSilencio").checked;

      let incluirSaltos = document.getElementById("inputSaltos").checked;

      let iniciaEmUm = document.getElementById("inputIniciaEmUm").checked;


      if((!sequenciaResposta || sequenciaResposta.length == 0) && quantidadeAleatoria) {
        if(qntSons > QUANTIDADE_MINIMA_DE_SONS) {
          qntSons = rando(QUANTIDADE_MINIMA_DE_SONS, qntSons)
          DBG('qnt=', qntSons)
        }
        else {
          let err = `Defina mais de ${QUANTIDADE_MINIMA_DE_SONS} sons`;
          DBG(err);
          alert(err);
          return;
        }
      }

      if(Tone.Transport.state == "started") {
        Tone.Transport.stop()
        Tone.Transport.cancel()
      }

      Tone.Transport.bpm.value = bpm;
      geraSequencia(qntTons, incluirSilencio, iniciaEmUm, incluirSaltos);

      await Tone.start();
      Tone.Transport.start();
      cria();

      DBG('audio is ready')
    }, false)
}