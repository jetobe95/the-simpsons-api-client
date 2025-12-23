const STORAGEKEY = "favoritos_ids";
const addFavorite = (id) => {
  const saved = localStorage.getItem(STORAGEKEY);
  const newFav = id;
  if (saved) {
    const list = new Set(JSON.parse(saved));
    if (list.has(newFav)) {
      list.delete(newFav);
    } else {
      list.add(newFav);
    }

    localStorage.setItem(STORAGEKEY, JSON.stringify(Array.from(list)));
  } else {
    localStorage.setItem(STORAGEKEY, JSON.stringify([newFav]));
  }
};

let favoritos = new Set();
const loadFavorites = () => {
  const saved = localStorage.getItem(STORAGEKEY);
  if (saved) {
    favoritos = new Set(JSON.parse(saved));
  }
};
function createEpisodeCard(data) {
  const card = document.createElement("li");
  card.className = "card-container";

  const path = data.image_path;
  const name = data?.name || "Personaje";

  // Construimos las URLs para cada tamaño disponible
  const url200 = `https://cdn.thesimpsonsapi.com/200${path}`;
  const url500 = `https://cdn.thesimpsonsapi.com/500${path}`;
  const url1280 = `https://cdn.thesimpsonsapi.com/1280${path}`;

  const imgHTML = `
  <img 
    src="${url500}" 
    srcset="${url200} 200w, 
            ${url500} 500w, 
            ${url1280} 1280w"
    sizes="(max-width: 320px) 200px, 
           (max-width: 768px) 500px, 
           1280px"
    alt="" 
    loading="lazy" 
    height="400"
    style="width: 100%; height: auto; object-fit: cover;"
  >
`;

  card.innerHTML = `
        <div class="card-image">
            ${imgHTML}
            <span class="season-badge">Temporada ${data?.season}</span>
        </div>
        <div class="card-content">
            <div class="header">
                <span class="episode-number">E${data?.episode_number
                  ?.toString()
                  .padStart(2, "0")}</span>
                <h2 class="title">${data?.name}</h2>
            </div>
            <p class="description">${data?.synopsis}</p>
             <div class="footer">
                        <button class="play-button" onclick="addFavorite(${
                          data.id
                        })">${favoritos.has(data.id) ? '★':'☆'}</button>
                    </div>
        </div>
    `;
  return card;
}

const fetchEpisodes = async () => {
  const chaptersList = document.querySelector("#chapters-list");

  const episodesUrl = `https://thesimpsonsapi.com/api/episodes?page=${page}`;
  const fetchEpisode = () =>
    globalThis.fetch(episodesUrl).then((res) => res.json());
  const episodes = await fetchEpisode();

  const fragment = document.createDocumentFragment();
  episodes.results.forEach((episode) => {
    const card = createEpisodeCard(episode);
    fragment.appendChild(card);
  });

  chaptersList?.appendChild(fragment);
};
let page = 1;

const main = async () => {
  const centinela = document.querySelector("#centinela");
  loadFavorites();

  await fetchEpisodes();

  // Configuración del Observer
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        page++;
        fetchEpisodes();
      }
    },
    {
      rootMargin: "0px 0px 10px 0px",
    }
  );

  centinela && observer.observe(centinela);
};

main();
