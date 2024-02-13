let carousel = document.getElementsByClassName("carousel");
let title = document.title;
let hamburger = document.getElementById("hamburger");
let navlinks = document.getElementById("navlinks");

// on fait sortir la navbar quand on clique sur le menu hamburger
hamburger.addEventListener("click", () => {
    navlinks.classList.toggle("open");
});

// on appelle la fonction qui fait fonctionner le carrousel seulement sur la bonne page
if (title === "Les Planètes") {
    moveCarousel();
}

// on affiche les données des planètes lorsque l'on clique sur l'une d'elles
else if (
    title != "Système Solaire" &&
    title != "Les Planètes" &&
    title != "Calendrier Astronomique"
) {
    let blockProperty = createNode("div", "block-property");
    let blockTitle = createNode("div", "block-title");
    blockProperty.appendChild(blockTitle);
    document.body.appendChild(blockProperty);
    if (title.includes(" ")) {
        title = lastWord(title);
    }
    displayElementData(title, blockProperty);
}

// permet d'afficher les données d'une planète choisie
function displayElementData(id, globalContainer) {
    // on fait la requête API qui sert à récupérer les données sur l'élément cliqué
    fetch(`https://api.le-systeme-solaire.net/rest.php/bodies/${id}`)
        // on met le résultat sous le format json supporté par JavaScript pour pouvoir manipuler la data venant de l'API
        .then((res) => res.json())

        // on utilise les données récupérées pour les afficher de la manière qu'on veut
        .then((data) => {
            // on liste les propriété (key -- value) en les mettant directement en forme dans le DOM
            for (var key in data) {
                // on vérifie que la propriété est bien celle de l'objet json et ne provient pas d'un héritage
                // et que la valeur de la propriété n'est ni null ni vide
                if (
                    data.hasOwnProperty(key) &&
                    key != "id" &&
                    key != "isPlanet" &&
                    key != "discoveredBy" &&
                    key != "discoveryDate" &&
                    data[key] != null &&
                    data[key] != ""
                ) {
                    // premier cas spécifique : si la propriété est le nom de la planète, on met la value dans un h1
                    if (key === "name") {
                        let title = createNode(
                            "h1",
                            "display-title-fr",
                            data[key].toUpperCase()
                        );
                        globalContainer.firstChild.appendChild(title);
                    }

                    // second cas spécifique : si la propriété est le nom anglais, on met la valeur dans un h3
                    else if (key === "englishName") {
                        let enName = createNode(
                            "h3",
                            "display-title-en",
                            data[key].toUpperCase()
                        );
                        globalContainer.firstChild.appendChild(enName);
                    }

                    // Sinon on répète le meme paterne -> nom de la propriété dans un p, valeur dans un autre, le tout dans une div
                    else {
                        // on déclare les variables dans lesquelles seront stockées la clé de la propriété et sa valeur
                        let cle;
                        let value;

                        // pour récupérer les lunes nous avons décidé d'afficher leur nombre pour chaque planète qui en possède
                        // l'API nous retourne une liste de lunes (d'objets), donc nous manipulons cette liste pour compter les lunes
                        if (key === "moons") {
                            // on définit le nom de la propriété à afficher dans le DOM
                            cle = "Moons";
                            // on récupère toutes les lunes (des objets JSON) pour pouvoir les compter ensuite
                            let moonsList = data[key].map(function (obj) {
                                return [obj.moon, obj.rel];
                            });
                            let nbMoons = 0;
                            for (var moon in moonsList) {
                                nbMoons++;
                            }
                            // On définit la valeur à afficher (le nombre de lune(s) de la planète)
                            value = nbMoons;
                        }

                        // dans les cas du volume et de la masse, l'API nous retourne un objet avec deux attributs : value et exponent
                        // Nous faisons donc une petite manipulation pour afficher cela correctement sous la forme 10exp(n)
                        // Nous n'utilisons pas la fonction Math.pow, car dans le cas du Soleil par exemple, sa masse dépasse le maxInt possible.
                        else if (key === "vol") {
                            cle = "volum";
                            value = `${data[key].volValue} x 10exp(${data[key].volExponent
                                }) ${getUnit(key)}`;
                        } else if (key === "mass") {
                            cle = "mass";
                            value = `${data[key].massValue} x 10exp(${data[key].massExponent
                                }) ${getUnit(key)}`;
                        }

                        // Sinon dans les autres cas, les valeurs retournées par l'API ne nécessitent pas de traitement
                        else {
                            cle = key;
                            value = `${data[key]} ${getUnit(key)}`;
                        }

                        // On injecte ces valeurs dans des balises HTML, puis dans le DOM en suivant l'arborescence que l'on souhaite
                        let container = createNode("div", "property");
                        let cleNode = createNode(
                            "p",
                            "key",
                            UpperFirstLetter(cle)
                        );
                        let linesNode = createNode("div", "lines");
                        let valueNode = createNode("p", "value", value);

                        globalContainer.appendChild(container);
                        container.appendChild(cleNode);
                        container.appendChild(linesNode);
                        container.appendChild(valueNode);
                    }
                }
            }
        })

        // si une erreur survient lors de la création de la nouvelle page d'affichage (après le dernier "then"),
        // l'erreur s'affiche dans la console.
        .catch((err) => {
            console.log(err);
        });
}

// beaucoup de balises HTML sont créées donc on a écrit une fonction qui simplifie leur création
function createNode(type, nameClass, txt, link) {
    let element = document.createElement(type);
    element.className = nameClass;
    element.textContent = txt;
    if (type === "a") {
        element.href = link;
    }
    return element;
}

// permet de récupérer le dernier mot d'un string (utile pour les noms d'astres qui ont un déterminant -> LA Terre, LE Soleil...)
function lastWord(str) {
    const word = str.split(" ");
    return word[word.length - 1];
}

// permet de mettre la première lettre d'un string en majuscule
function UpperFirstLetter(str) {
    return str.substring(0, 1).toUpperCase() + str.substring(1);
}

// permet de retourner l'unité correspondant à la propriété choisie
function getUnit(property) {
    if (
        property === "semimajorAxis" ||
        property === "perihelion" ||
        property === "aphelion" ||
        property === "meanRadius" ||
        property === "equaRadius" ||
        property === "polarRadius" ||
        property === "dimension"
    )
        return "km";
    else if (
        property === "inclination" ||
        property === "mainAnomaly" ||
        property === "argPeriapsis" ||
        property === "longAscNode"
    )
        return "°";
    else if (property === "mass") return "kg";
    else if (property === "vol") return "km³";
    else if (property === "density") return "g.cm³";
    else if (property === "gravity") return "m.s⁻²";
    else if (property === "escape") return "m.s⁻¹";
    else if (property === "sideralOrbit") return "jours";
    else if (property === "sideralRotation") return "heures";
    else if (property === "avgTemp") return "K";
    return "";
}

/******************* CAROUSEL *******************/

function moveCarousel() {

    // compteur pour calculer le nb de déplacements
    let count = 0;

    // position initiale du carousel
    let position = 0;

    // on récupère le carousel et on définit le décalage en fonction de la taille de l'écran
    let carousel = document.querySelector(".carousel-elements");

    // on définit le nombre de déplacements max et la taille du déplacement en fonction de la taille de l'écran
    let decalage = 0;
    let maxCount = 0;
    if (window.innerWidth > 1400) {
        decalage = (65 - 4) / 3 + 2;
        maxCount = 6;
    } else if (window.innerWidth > 1000 && window.innerWidth <= 1400) {
        decalage = (50 - 4) / 2 + 2;
        maxCount = 7;
    } else if (window.innerWidth <= 1000) {
        decalage = 74 + 2.5;
        maxCount = 8;
    }

    // si on clique sur la flèche de droite, on déplace le carousel vers la droite de déplacement en modifiant sa position
    document.querySelector(".arrow-right").addEventListener("click", () => {

        // on vérifie que le nombre de déplacements n'a pas atteint le max ou min (0)
        if (count === maxCount) {
            position = -(maxCount * decalage);
            count += 0;
        } else {
            position -= decalage;
            count += 1;
        }
        carousel.style.transform = "translateX(calc(" + position + "vw))";
        carousel.style.transition = "0.5s ease";
    });

    // si on clique sur la flèche de gauche, on déplace le carousel vers la gauche de déplacement en modifiant sa position
    document.querySelector(".arrow-left").addEventListener("click", () => {

        // on vérifie que le nombre de déplacements n'a pas atteint le max ou min (0)
        if (count === 0) {
            position = 0;
            count += 0;
        } else {
            position += decalage;
            count -= 1;
        }
        carousel.style.transform = "translateX(calc(" + position + "vw))";
        carousel.style.transition = "0.5s ease";
    });
}
