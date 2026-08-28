document.getElementById('year').textContent = new Date().getFullYear();

(function(){
  // Cole aqui a URL do seu Google Apps Script depois de publicar (veja instruções no README)
  var SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwhM8eybu59EPl8DB14OK2zwB8lhMaQhGiuZh9INRqLpFYH4TLpSTgmPaJ4EHv8xU-b/exec';

  var answers = {nome:'', telefone:'', instagram:'', nivel:null, expertise:null, interesse:[], tempo:null, aberta:''};
  var steps = Array.from(document.querySelectorAll('.quiz-step'));
  var fill = document.getElementById('quizFill');
  var label = document.getElementById('quizLabel');
  var current = 0;
  var totalSteps = 7; // steps 0-6 são perguntas/prova, step 7 é o resultado + preço

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

  // Step 0: nome, telefone (obrigatórios) e instagram (opcional)
  var nameInput = document.getElementById('quizName');
  var phoneInput = document.getElementById('quizPhone');
  var instaInput = document.getElementById('quizInstagram');
  var nameNext = document.getElementById('nameNext');

  function checkStep0(){
    var ok = nameInput.value.trim() && phoneInput.value.trim();
    if(ok){ nameNext.classList.add('enabled'); } else { nameNext.classList.remove('enabled'); }
  }
  nameInput.addEventListener('input', checkStep0);
  phoneInput.addEventListener('input', checkStep0);

  function submitStep0(){
    if(!nameInput.value.trim() || !phoneInput.value.trim()) return;
    answers.nome = nameInput.value.trim();
    answers.telefone = phoneInput.value.trim();
    answers.instagram = instaInput.value.trim();
    showStep(1);
  }
  nameNext.addEventListener('click', submitStep0);
  nameInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') submitStep0(); });
  phoneInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') submitStep0(); });
  instaInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') submitStep0(); });

  // Steps 1-4: perguntas de múltipla escolha
  steps.forEach(function(step, idx){
    if(idx === 0 || idx > 4) return;
    var opts = step.querySelectorAll('.quiz-opt');
    var key = step.querySelector('.quiz-options') ? step.querySelector('.quiz-options').dataset.key : null;
    var nextBtn = step.querySelector('.quiz-next');
    var backBtn = step.querySelector('.quiz-back');

    var multi = (key === 'interesse');

    opts.forEach(function(opt){
      opt.addEventListener('click', function(){
        if(multi){
          opt.classList.toggle('selected');
          answers[key] = Array.from(opts)
            .filter(function(o){ return o.classList.contains('selected'); })
            .map(function(o){ return o.textContent; });
          if(nextBtn){
            if(answers[key].length > 0) nextBtn.classList.add('enabled');
            else nextBtn.classList.remove('enabled');
          }
        } else {
          opts.forEach(function(o){ o.classList.remove('selected'); });
          opt.classList.add('selected');
          answers[key] = opt.textContent;
          if(nextBtn) nextBtn.classList.add('enabled');
        }
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

  // Step 5: campo aberto -> leva pro passo de prova social (step 6), ainda não finaliza
  var openField = document.getElementById('quizOpen');
  var continueBtn = document.getElementById('quizContinue');
  var skipBtn = document.getElementById('quizSkip');
  var openBack = steps[5].querySelector('.quiz-back');
  if(openBack){ openBack.addEventListener('click', function(){ showStep(4); }); }

  function goToProof(){
    answers.aberta = openField.value.trim();
    showStep(6);
  }
  if(continueBtn) continueBtn.addEventListener('click', goToProof);
  if(skipBtn) skipBtn.addEventListener('click', goToProof);

  // Step 6: prova social -> ao continuar, monta o resultado e revela o preço (mesmo passo final)
  var proofBack = steps[6].querySelector('.quiz-back');
  var proofNext = document.getElementById('quizProofNext');
  if(proofBack){ proofBack.addEventListener('click', function(){ showStep(5); }); }

  function finish(){
    buildResult();
    sendToSheet();
    showStep(7);
  }
  if(proofNext) proofNext.addEventListener('click', finish);

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
          telefone: answers.telefone || '',
          instagram: answers.instagram || '',
          nivel: answers.nivel || '',
          expertise: answers.expertise || '',
          interesse: (answers.interesse || []).join(', '),
          tempo: answers.tempo || '',
          comentario: answers.aberta || ''
        })
      });
    } catch(e) {
      // Falha silenciosa: nunca deve travar a experiência do usuário
    }
  }

  function joinNatural(arr){
    if(arr.length === 0) return '';
    if(arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1];
  }

  function buildResult(){
    var primeiroNome = (answers.nome || '').split(' ')[0];

    document.getElementById('resultTitle').textContent =
      primeiroNome ? 'Perfeito, ' + primeiroNome + '.' : 'Perfeito.';

    var nivelTxt = {
      'Ainda não tenho resultados':'começando do zero',
      'Tenho resultados, mas inconsistentes':'com resultados, mas ainda inconsistentes',
      'Vivo disso e quero escalar':'vivendo disso e buscando escalar'
    }[answers.nivel] || 'construindo seu caminho';

    var expertiseTxt = answers.expertise ? answers.expertise.toLowerCase() : null;
    var interesseTxt = (answers.interesse && answers.interesse.length)
      ? joinNatural(answers.interesse.map(function(s){ return s.toLowerCase(); }))
      : 'crescer no seu ritmo';

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
