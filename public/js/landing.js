const heroBall = document.getElementById("heroBall");

if (heroBall) {
  window.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 45;
    const y = (window.innerHeight / 2 - e.clientY) / 45;

    heroBall.style.transform = `rotateY(${-x}deg) rotateX(${y}deg)`;
  });

  window.addEventListener("mouseleave", () => {
    heroBall.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}