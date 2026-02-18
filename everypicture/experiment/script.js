(function () {
  'use strict';

  const slides = [
    {
      file: 'baby.jpg',
      caption: 'My grandma is holding me and this photo feels like comfort and belonging.'
    },
    {
      file: 'school.jpg',
      caption: 'This is my Chinese school performance and it reminds me of learning Chinese for my parents.'
    },
    {
      file: 'written.jpg',
      caption: 'These worksheets represent the repetitive studying that made the language feel frustrating and distant.'
    },
    {
      file: 'order.jpg',
      caption: 'This was my first time having a full conversation in Chinese while my grandma cooking was curious about my background.'
    },
    {
      file: 'costume.jpg',
      caption: 'This is me in traditional clothing and it represents the courage it took to claim that part of my identity.'
    }
  ];

  
  const container = document.querySelector('#content');
  const capText = document.querySelector('#capText');
  const nextBtn = document.querySelector('#next');
  const prevBtn = document.querySelector('#previous');
  const thumbs = document.querySelectorAll('.thumb');

  let currentImage = 0;

  function setCaption(index) {
    capText.innerHTML = slides[index].caption;
  }

  function setActiveThumb(index) {
    thumbs.forEach(function (t) { t.classList.remove('active'); });
    thumbs[index].classList.add('active');
  }

  function getTopImage() {
    const imgs = container.querySelectorAll('img');
    if (!imgs.length) return null;
    return imgs[imgs.length - 1];
  }


  function swapImage(index) {
    const newSlide = document.createElement('img');
    newSlide.src = `images/${slides[index].file}`;
    newSlide.alt = 'slide';
    newSlide.className = 'fadeinimg';
    container.appendChild(newSlide);

    const imgs = container.querySelectorAll('img');
    if (imgs.length > 2) {
      container.removeChild(imgs[0]);
    }

    setCaption(index);
    setActiveThumb(index);
    applyMode(index);
  }


  let prevYLoc = 0;


  let prevSchoolX = 0;

  function onSchoolZoomMove(event) {
    const img = getTopImage();
    if (!img) return;

    const rect = container.getBoundingClientRect();


    const percentX = rect.width / 100;
    const percentY = rect.height / 100;

    const mousePosX = Math.ceil((event.clientX - rect.left) / percentX);
    const mousePosY = Math.ceil((event.clientY - rect.top) / percentY);


    if (mousePosX === prevSchoolX) return;
    prevSchoolX = mousePosX;


    let zoom = 100 + (mousePosX * 0.8);
    if (zoom < 100) zoom = 100;
    if (zoom > 180) zoom = 180;


    img.style.width = zoom + '%';
    img.style.height = zoom + '%';



    const extraW = (zoom - 100) / 100 * rect.width;
    const extraH = (zoom - 100) / 100 * rect.height;

    const xRatio = mousePosX / 100;
    const yRatio = mousePosY / 100;

    img.style.left = (-extraW * xRatio) + 'px';
    img.style.top = (-extraH * yRatio) + 'px';
  }


  function onWrittenMove(event) {
    const img = getTopImage();
    if (!img) return;

    const rect = container.getBoundingClientRect();
    const heightDegree = rect.height / 360;
    const yPos = event.clientY - rect.top;
    const changeRotation = Math.floor(yPos / heightDegree);

    if (changeRotation !== prevYLoc) {
      img.style.transform = `rotate(${changeRotation}deg)`;
      prevYLoc = changeRotation;
    }
  }



  const orderBaseScale = 1.08;

  function onOrderFollow(event) {
    const img = getTopImage();
    if (!img) return;

    const rect = container.getBoundingClientRect();


    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    const maxShift = 18; 
    const shiftX = -(px * maxShift);
    const shiftY = -(py * maxShift);

    img.style.transform = `scale(${orderBaseScale}) translate(${shiftX}px, ${shiftY}px)`;
  }


  function onCostumePan(event) {
    const img = getTopImage();
    if (!img) return;

    img.style.width = '100%';
    img.style.height = '150%';
    img.style.left = '0';

    const rect = container.getBoundingClientRect();
    const percent = rect.height / 100;
    const mousePosY = Math.ceil((event.clientY - rect.top) / percent);

    const extra = rect.height * 0.50;
    const shift = (mousePosY / 100) * extra;

    img.style.top = (-shift) + 'px';

  }


  function clearInteractions() {
    const img = getTopImage();
    if (img) {
      img.style.transform = 'none';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.opacity = '1';
      img.className = 'fadeinimg';

    } 

    container.removeEventListener('mousemove', onSchoolZoomMove);
    container.removeEventListener('mousemove', onWrittenMove);
    container.removeEventListener('mousemove', onOrderFollow);
    container.removeEventListener('mousemove', onCostumePan);

    prevYLoc = 0;
    prevSchoolX = 0;
  }

  function applyMode(index) {
    clearInteractions();

    const img = getTopImage();
    if (!img) return;

    if (index === 0) {
      img.className = 'fadeinimg babyZoom';
    }

    
    if (index === 1) {
      img.className = 'fadeinimg interactive'; 
      img.style.width = '100%';
      img.style.height = '100%';

      img.style.left = '0px';
      img.style.top = '0px'; 
      container.addEventListener('mousemove', onSchoolZoomMove); 
    }


    if (index === 2) {
      container.addEventListener('mousemove', onWrittenMove);
    }


    if (index === 3) {
      img.className = 'fadeinimg interactive';
      img.style.transform = `scale(${orderBaseScale})`;
      container.addEventListener('mousemove', onOrderFollow);
    }

    if (index === 4) {
      container.addEventListener('mousemove', onCostumePan);
      img.style.top = '0px';
    }
  }

  nextBtn.addEventListener('click', function () {
    currentImage++;
    if (currentImage > slides.length - 1) currentImage = 0;
    swapImage(currentImage);
  });

  prevBtn.addEventListener('click', function () {
    currentImage--;
    if (currentImage < 0) currentImage = slides.length - 1;
    swapImage(currentImage);
  });


  thumbs.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      currentImage = i;
      swapImage(currentImage);
    });
  });

  
  setCaption(0);
  setActiveThumb(0);
  applyMode(0); 

})();
