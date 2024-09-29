

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=soft&color=timeGradient&height=300&&section=header&text=夜%20之%20向%20日%20葵&fontSize=90&fontAlign=50&fontAlignY=30&desc=人啊!幸福地活下去吧!&descAlign=50&descSize=30&descAlignY=60&animation=twinkling" />
</p>


<!-- https://github.com/DenverCoder1/readme-typing-svg -->
<p align="center">
<img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=25&pause=1000&center=true&vCenter=true&random=false&width=600&lines=Welcome+to+my+GitHub+profile+page!;Night+Helianthus!" />
</p>

<style>
  .carousel {
    overflow: hidden;
    position: relative;
    width: 600px;
    height: 400px;
    margin: auto;
  }
  .carousel-container {
    display: flex;
    width: calc(100% * 3); /* 3 images */
    position: relative;
    transition: transform 0.5s ease-in-out;
  }
  .carousel img {
    width: calc(100% / 3); /* 3 images */
    height: 100%;
    flex-shrink: 0;
  }
  #prevBtn, #nextBtn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
    cursor: pointer;
    border: none;
  }
  #prevBtn {
    left: 10px;
  }
  #nextBtn {
    right: 10px;
  }
</style>

<body>

<div class="carousel">
  <div class="carousel-container">
    <img src="image/水上由歧.jpg" alt="素晴日" style="display:block;margin-left: auto;margin-right: auto;">
    <img src="image/素晴日.jpg" alt="素晴日" style="display:block;margin-left: auto;margin-right: auto;">
    <img src="image/素晴日2.jpg" alt="素晴日" style="display:block;margin-left: auto;margin-right: auto;">
    <img src="image/水上由歧.jpg" alt="素晴日" style="display:block;margin-left: auto;margin-right: auto;">
    <!-- Duplicate of the first image for seamless loop -->
  </div>
  <button id="prevBtn">Prev</button>
  <button id="nextBtn">Next</button>
</div>

<script>
  let currentSlide = 0;
  const slides = document.querySelectorAll('.carousel img');
  const totalSlides = slides.length - 1; // Exclude the duplicate image
  const carouselContainer = document.querySelector('.carousel-container');

  function showSlide(index) {
    if (index >= totalSlides) {
      // Reset to the first slide
      index = 0;
    }
    carouselContainer.style.transform = `translateX(-${index * 100 / totalSlides}%)`;
    currentSlide = index;
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  document.getElementById('nextBtn').addEventListener('click', nextSlide);
  document.getElementById('prevBtn').addEventListener('click', prevSlide);

  // Automatically change slide every 6 seconds
  setInterval(nextSlide, 6000);

  // Initially show the first slide
  showSlide(0);
</script>

</body>


<p align="center">
<!-- https://github.com/anuraghazra/github-readme-stats -->
<img align="center" width="400" src="https://github-readme-stats.vercel.app/api?username=SXP-Simon&theme=transparent&show_icons=true&hide_border=true&show=reviews&hide_title=true&hide=contribs" />
<!-- https://github.com/DenverCoder1/github-readme-streak-stats -->
<img align="center" width="400" src="https://streak-stats.demolab.com?user=SXP-Simon&theme=transparent&hide_border=true" />

<!-- https://github.com/Ashutosh00710/github-readme-activity-graph -->
<img width="800" src="https://github-readme-activity-graph.vercel.app/graph?username=SXP-Simon&theme=github-compact&hide_border=true&area=true&custom_title=Contribution%20Graph" />
<br/>
<!-- https://github.com/anuraghazra/github-readme-stats -->
<img align="center" src="https://github-readme-stats.vercel.app/api/wakatime?username=NightHelianthus&theme=transparent&hide_border=true&layout=compact&langs_count=22" />
<!-- https://github.com/anuraghazra/github-readme-stats -->
<img align="center" src="https://github-readme-stats.vercel.app/api/top-langs/?username=SXP-Simon&theme=transparent&hide_border=true&layout=donut-vertical&langs_count=6" />
<br/>
<!-- https://github.com/LelouchFR/skill-icons -->
<img align="center" src="https://go-skill-icons.vercel.app/api/icons?i=py,pycharm,steam,html,css,js,githubcopilot,linux">
</p>


<!-- https://github.com/badges/shields -->
<p align="center">
<a href="https://github.com/SXP-Simon"><img src="https://img.shields.io/badge/GitHub-回归天空-blue?logo=github" /></a>
<a href="https://space.bilibili.com/609923881"><img src="https://img.shields.io/badge/没有传说的傻小胖-blue?logo=bilibili" /></a>
<!-- https://github.com/antonkomarev/github-profile-views-counter -->
<img src="https://komarev.com/ghpvc/?username=SXP-Simon" />
</p>

<!-- https://github.com/kyechan99/capsule-render -->
<p align="center">
<img src="https://capsule-render.vercel.app/api?type=soft&color=timeGradient&height=300&&section=footer&text=THE%20END&fontSize=90&fontAlign=50&fontAlignY=70&desc=Hope%20your%20program%20is%20bug-free!&descAlign=50&descSize=30&descAlignY=40&animation=twinkling" />
</p>
