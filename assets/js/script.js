  document.getElementById('year').textContent = new Date().getFullYear();

  (function(){
    // Cole aqui a URL do seu Apps Script depois de publicar (veja instruções no README)
    var SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwhM8eybu59EPl8DB14OK2zwB8lhMaQhGiuZh9INRqLpFYH4TLpSTgmPaJ4EHv8xU-b/exec';

    var answers = {nivel:null, expertise:null, interesse:[], tempo:null, aberta:''};
    var steps = Array.from(document.querySelectorAll('.quiz-step'));
    var fill = document.getElementById('quizFill');
    var label = document.getElementById('quizLabel');
    var current = 0;
    var totalSteps = 5; // steps 0-4 are questions, step 5 is result

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
    }

    steps.forEach(function(step, idx){
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

      if(nextBtn && !nextBtn.id){
        nextBtn.addEventListener('click', function(){
          if(!nextBtn.classList.contains('enabled')) return;
          if(idx + 1 <= totalSteps) showStep(idx+1);
        });
      }
      if(backBtn){
        backBtn.addEventListener('click', function(){ showStep(idx-1); });
      }
    });

    var openField = document.getElementById('quizOpen');
    var finishBtn = document.getElementById('quizFinish');
    var skipBtn = document.getElementById('quizSkip');

    function finish(){
      answers.aberta = openField.value.trim();
      buildResult();
      sendToSheet();
      var precoSection = document.getElementById('preco');
      if(precoSection) precoSection.style.display = '';
      showStep(5);
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
        'É exatamente esse perfil que faz o Electi Club valer a pena. Que tal garantir sua vaga antes que o investimento suba?';
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
      // Se algo falhar, garante que o conteúdo continua visível
      document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in-view'); });
    }
  })();
