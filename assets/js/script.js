  document.getElementById('year').textContent = new Date().getFullYear();

  (function(){
    var answers = {nivel:null, interesse:null, tempo:null, aberta:''};
    var steps = Array.from(document.querySelectorAll('.quiz-step'));
    var fill = document.getElementById('quizFill');
    var label = document.getElementById('quizLabel');
    var current = 0;
    var totalSteps = 4; // steps 0-3 are questions, step 4 is result

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

      opts.forEach(function(opt){
        opt.addEventListener('click', function(){
          opts.forEach(function(o){ o.classList.remove('selected'); });
          opt.classList.add('selected');
          answers[key] = opt.textContent;
          if(nextBtn) nextBtn.classList.add('enabled');
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
      var precoSection = document.getElementById('preco');
      if(precoSection) precoSection.style.display = '';
      showStep(4);
    }
    if(finishBtn) finishBtn.addEventListener('click', finish);
    if(skipBtn) skipBtn.addEventListener('click', finish);

    function buildResult(){
      var nivelTxt = {
        'Iniciante':'começando agora',
        'Já tenho resultados':'já com resultados',
        'Já vivo disso':'já vivendo de marketing digital'
      }[answers.nivel] || 'construindo seu caminho';

      var interesseTxt = answers.interesse ? answers.interesse.toLowerCase() : 'marketing digital';

      var tempoTxt = {
        'Só acompanhar':'começando devagar, apenas acompanhando',
        'De vez em quando':'participando quando possível',
        'Ativamente':'disposto a participar ativamente'
      }[answers.tempo] || 'no seu ritmo';

      document.getElementById('resultBody').textContent =
        'Você está ' + nivelTxt + ', focado em ' + interesseTxt + ', e ' + tempoTxt + '. ' +
        'É exatamente esse perfil que faz o Electi Club valer a pena. Que tal garantir sua vaga antes que o investimento suba?';
    }
  })();