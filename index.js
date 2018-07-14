const express = require('express');
const bodyParser = require('body-parser');

const dbPokedex = require('./pokedex.json');
const dbPokemonTypes = require('./pokemon-types.json');

const app = express();
app.use(bodyParser.json());

var allTypes = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

// Load routes
app.post('/pokemon-informations', getPokemonInformations);
app.post('/pokemon-evolutions', getPokemonEvolutions);
app.post('/strongAgainst', getStrongAgainst);
app.post('/weakAgainst', getWeakAgainst);
app.post('/pokemonStrongAgainst', getPokemonStrongAgainst);
app.post('/pokemonWeakAgainst', getPokemonWeakAgainst);
app.post('/errors', function (req, res) {
    console.error(req.body);
    res.sendStatus(200);
    var currentdate = new Date();
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    console.log(datetime)
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));


function findPokemonByName(name) {
    const data = dbPokedex.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!data) {
        return null;
    }
    return data;
};


function getPokemonInformations(req, res) {
    const pokemon = req.body.conversation.memory.pokemon;
    const pokemonInfos = findPokemonByName(pokemon.value);

    if (!pokemonInfos) {
        res.json({
            replies: [
                {type: 'text', content: `I don't know a Pokémon called ${pokemon} :(`},
            ],
        });
    } else {
        res.json({
            replies: [
                {type: 'text', content: `🔎${pokemonInfos.name} infos`},
                {type: 'text', content: `Type(s): ${pokemonInfos.types.join(' and ')}`},
                {type: 'text', content: pokemonInfos.description},
                {type: 'picture', content: pokemonInfos.image},
            ],
        });
    }
}


function getPokemonEvolutions(req, res) {
    const pokemon = req.body.conversation.memory.pokemon;
    const pokemonInfos = findPokemonByName(pokemon.value);

    if (!pokemonInfos) {
        res.json({
            replies: [
                {type: 'text', content: `I don't know a Pokémon called ${pokemon} :(`},
            ],
        });
    } else if (pokemonInfos.evolutions.length === 1) {
        res.json({
            replies: [{type: 'text', content: `${pokemonInfos.name} has no evolutions.`}],
        });
    } else {
        res.json({
            replies: [
                {type: 'text', content: `🔎${pokemonInfos.name} family`},
                {
                    type: 'text',
                    content: pokemonInfos.evolutions.map(formatEvolutionString).join('\n'),
                },
                {
                    type: 'card',
                    content: {
                        title: 'See more about them',
                        buttons: pokemonInfos.evolutions
                            .filter(p => p.id !== pokemonInfos.id) // Remove initial pokemon from list
                            .map(p => ({
                                type: 'postback',
                                title: p.name,
                                value: `Tell me more about ${p.name}`,
                            })),
                    },
                },
            ],
        });
    }
}


function formatEvolutionString(evolution) {
    let base = `🔸 ${evolution.name}`;
    if (evolution.trigger === 'leveling') {
        base += ` -> lvl ${evolution.trigger_lvl}`;
    }
    if (evolution.trigger === 'item') {
        base += ` -> ${evolution.trigger_item}`;
    }
    return base;
}

function getStrongAgainst(req, res) {
    const type = req.body.conversation.memory.type;
    const typeInfos = findTypeByName(type.value);

    var result = typeInfos.name + " is strong against:\n* ";
    result += typeInfos.strengths.join(" \n* ");
    if (!type) {
        res.json({
            replies: [
                {type: 'text', content: `I don't know a type called ${type} :(`},
            ],
        });
    } else {
        res.json({
            replies: [
                {type: 'text', content: result},
            ],
        });
    }
}

function getWeakAgainst(req, res) {
    const type = req.body.conversation.memory.type;
    const typeInfos = findTypeByName(type.value);

    var result = typeInfos.name + " is weak against:\n* ";
    result += typeInfos.weaknesses.join(" \n* ");
    if (!type) {
        res.json({
            replies: [
                {type: 'text', content: `I don't know a type called ${type} :(`},
            ],
        });
    } else {
        res.json({
            replies: [
                {type: 'text', content: result},
            ],
        });
    }
}

function findTypeByName(name) {
    const data = dbPokemonTypes.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!data) {
        return null;
    }
    return data;
};

function getPokemonStrongAgainst(req, res) {
    const pokemon = req.body.conversation.memory.pokemon;
    const pokemonInfos = findPokemonByName(pokemon.value);
    var typeInfos = "";
    var i;

    var result = pokemonInfos.name + " is strong against:";
    for (i = 0; i < pokemonInfos.types.length; i++) {
        typeInfos = findTypeByName(pokemonInfos.types[i]);
        if (typeInfos.strengths.length > 0) {
            result += "\n* " + typeInfos.strengths.join(" \n* ");
        }
    }
    if (!pokemon) {
        res.json({
            replies: [
                {type: 'text', content: `I don't know a pokemon called ${pokemonInfos.name} :(`},
            ],
        });
    } else {
        res.json({
            replies: [
                {type: 'text', content: result},
            ],
        });
    }
}

function getPokemonWeakAgainst(req, res) {
    const pokemon = req.body.conversation.memory.pokemon;
    const pokemonInfos = findPokemonByName(pokemon.value);
    var typeInfos = "";
    var i;

    var result = pokemonInfos.name + " is weak against:";
    for (i = 0; i < pokemonInfos.types.length; i++) {
        typeInfos = findTypeByName(pokemonInfos.types[i]);
        if (typeInfos.weaknesses.length > 0) {
            result += "\n* " + typeInfos.weaknesses.join(" \n* ");
        }
    }
    if (!pokemon) {
        res.json({
            replies: [
                {type: 'text', content: `I don't know a pokemon called ${pokemonInfos.name} :(`},
            ],
        });
    } else {
        res.json({
            replies: [
                {type: 'text', content: result},
            ],
        });
    }
}