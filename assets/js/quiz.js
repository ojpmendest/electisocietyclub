document.getElementById('year').textContent = new Date().getFullYear();

(function(){
  // Cole aqui a URL do seu Google Apps Script depois de publicar (veja instruções no README)
  var SHEET_WEBHOOK_URL = '';

  var answers = {nome:'', nivel:null, expertise:null, interesse:null, tempo:null, aberta:''};
  var steps = Array.from(document.querySelectorAll('.quiz-step'));
  var fill = document.getElementById('quizFill');
  var label = document.getElementById('quizLabel');
  var current = 0;
  var totalSteps = 6; // steps 0-5 são perguntas, step 6 é o resultado

  function showStep(i){
    steps.forEach(function(s){ s.classList.remove('active'); });
    steps[i].classList.add('active');
    current = i;
    if(i < totalSteps){
      fill.style.width = (((i+1)/totalSteps)*100) + '%';
      label.textContent = 'Passo ' + (i+1) + ' de ' + totalSteps;
    } else {
      fill.style.width = '100%';
      label.textContent = 'Pronto';
    }
    var heading = steps[i].querySelector('h3');
    if(heading){ heading.focus && heading.setAttribute('tabindex','-1'); }
  }

  // Step 0: nome
  var nameInput = document.getElementById('quizName');
  var nameNext = document.getElementById('nameNext');
  nameInput.addEventListener('input', function(){
    var v = nameInput.value.trim();
    if(v){ nameNext.classList.add('enabled'); } else { nameNext.classList.remove('enabled'); }
  });
  nameNext.addEventListener('click', function(){
    var v = nameInput.value.trim();
    if(!v) return;
    answers.nome = v;
    showStep(1);
  });
  nameInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && nameInput.value.trim()){ showStep(1); }
  });

  // Steps 1-4: perguntas de múltipla escolha
  steps.forEach(function(step, idx){
    if(idx === 0 || idx > 4) return;
    var opts = step.querySelectorAll('.quiz-opt');
    var key = step.querySelector('.quiz-options') ? step.querySelector('.quiz-options').dataset.key : null;
    var nextBtn = step.querySelector('.quiz-next');
    var backBtn = step.querySelector('.quiz-back');

    opts.forEach(function(opt){
      opt.addEventListener('click', function(){
        opts.forEach(function(o){ o.classList.remove('selected'); });
        opt.classList.add('selected');
        answers[key] = opt.textContent;
        if(nextBtn) nextBtn.classList.add('enabled');
      });
    });

    if(nextBtn){
      nextBtn.addEventListener('click', function(){
        if(!nextBtn.classList.contains('enabled')) return;
        showStep(idx+1);
      });
    }
    if(backBtn){
      backBtn.addEventListener('click', function(){ showStep(idx-1); });
    }
  });

  // Step 5: campo aberto
  var openField = document.getElementById('quizOpen');
  var finishBtn = document.getElementById('quizFinish');
  var skipBtn = document.getElementById('quizSkip');
  var openBack = steps[5].querySelector('.quiz-back');
  if(openBack){ openBack.addEventListener('click', function(){ showStep(4); }); }

  function finish(){
    answers.aberta = openField.value.trim();
    buildResult();
    sendToSheet();
    var provaSection = document.getElementById('prova');
    if(provaSection){
      provaSection.style.display = '';
      // revelado via JS, não por scroll: ativa a animação na hora, sem depender do IntersectionObserver
      provaSection.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in-view'); });
    }
    var precoSection = document.getElementById('preco');
    if(precoSection) precoSection.style.display = '';
    showStep(6);
  }
  if(finishBtn) finishBtn.addEventListener('click', finish);
  if(skipBtn) skipBtn.addEventListener('click', finish);

  function sendToSheet(){
    if(!SHEET_WEBHOOK_URL) return;
    try {
      fetch(SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({
          data: new Date().toISOString(),
          nome: answers.nome || '',
          nivel: answers.nivel || '',
          expertise: answers.expertise || '',
          interesse: answers.interesse || '',
          tempo: answers.tempo || '',
          comentario: answers.aberta || ''
        })
      });
    } catch(e) {
      // Falha silenciosa: nunca deve travar a experiência do usuário
    }
  }

  function buildResult(){
    var primeiroNome = (answers.nome || '').split(' ')[0];

    document.getElementById('resultTitle').textContent =
      primeiroNome ? 'Perfeito, ' + primeiroNome + '.' : 'Perfeito.';

    var nivelTxt = {
      'Iniciante':'começando agora',
      'Já tenho resultados':'já com resultados',
      'Já vivo disso':'já vivendo de marketing digital'
    }[answers.nivel] || 'construindo seu caminho';

    var expertiseTxt = answers.expertise ? answers.expertise.toLowerCase() : null;
    var interesseTxt = answers.interesse ? answers.interesse.toLowerCase() : 'crescer no seu ritmo';

    var tempoTxt = {
      'Só acompanhar':'começando devagar, apenas acompanhando',
      'De vez em quando':'participando quando possível',
      'Ativamente':'disposto a participar ativamente'
    }[answers.tempo] || 'no seu ritmo';

    var perfilTxt = expertiseTxt
      ? 'Você está ' + nivelTxt + ' em ' + expertiseTxt + ', buscando ' + interesseTxt + ', e ' + tempoTxt + '. '
      : 'Você está ' + nivelTxt + ', buscando ' + interesseTxt + ', e ' + tempoTxt + '. ';

    document.getElementById('resultBody').textContent =
      perfilTxt +
      'Agora já sabemos quem está chegando, e a comunidade também vai saber. Garanta sua vaga antes que o investimento suba.';
  }
})();

// Scroll reveal
(function(){
  try {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var els = document.querySelectorAll('.reveal');
    if(reduceMotion || !('IntersectionObserver' in window)){
      els.forEach(function(el){ el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -30px 0px'});
    els.forEach(function(el){ io.observe(el); });
  } catch(e) {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in-view'); });
  }
})();
