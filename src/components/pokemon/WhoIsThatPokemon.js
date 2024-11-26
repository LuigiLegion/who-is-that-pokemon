// Imports
import { useState, useEffect } from 'react';
import pokemonNumberRangesByGen from '../../data/pokemon-number-ranges-by-gen.json';

// Initializations
const VOICE_URI_IOS = 'Samantha';
const VOICE_URI_NON_IOS = 'Zira';
const WHO_IS_THAT_POKEMON = "Who's that Pokemon?";

const synth = window.speechSynthesis;
let voices;

const getVoices = () => {
  voices = synth.getVoices();
};

const getUtteranceVoice = voices =>
  voices.find(voice => voice.voiceURI === VOICE_URI_IOS) ||
  voices.find(voice => voice.voiceURI.includes(VOICE_URI_NON_IOS));

synth.onvoiceschanged = getVoices;
getVoices();
const utteranceVoice = getUtteranceVoice(voices);

const isStringOfTrue = value => value === 'true';

const getRandomPokemonNumber = ({ min, max }) => Math.floor(Math.random() * (max - min) + min);

const getPokeApiEndpointUrl = gen => `https://pokeapi.co/api/v2/pokemon/${getRandomPokemonNumber(pokemonNumberRangesByGen[gen])}`;

const capitalizeFirstLetter = word => word[0].toUpperCase() + word.slice(1);

// Components
const WhoIsThatPokemon = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(true);
  const [sprite, setSprite] = useState('');
  const [name, setName] = useState('');
  const [guess, setGuess] = useState('');
  const [gen, setGen] = useState('I-IX');

  useEffect(() => {
    handleIsDarkOnInitialLoad();

    const handleGenerateOnInitialLoad = async () => await handleGenerate();

    handleGenerateOnInitialLoad();
  }, []);

  useEffect(() => {
    if (guess && name && guess === name) {
      handleReveal();
    }
  }, [guess]);

  const handleIsDark = event => {
    const isDarkTheme = isStringOfTrue(event.target.value);

    setIsDark(isDarkTheme);
    localStorage.setItem('isDarkTheme', isDarkTheme);
    document.body.classList.toggle('dark-theme');
  };

  const handleIsDarkOnInitialLoad = () => {
    const isDarkTheme = isStringOfTrue(localStorage.getItem('isDarkTheme'));

    setIsDark(isDarkTheme);

    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const handleIsMuted = event => {
    setIsMuted(isStringOfTrue(event.target.value));
  };

  const handleIsMaster = event => {
    setIsMaster(isStringOfTrue(event.target.value));
  };

  const handleGen = event => {
    setGen(event.target.value);
  };

  const handleFetch = async () => await fetch(getPokeApiEndpointUrl(gen))
    .then(response => response.json())
    .catch(error => console.error(error.message));

  const readAloud = text => {
    if (!isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = utteranceVoice;

      synth.speak(utterance);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setSprite('');
    setName('');
    setGuess('');
    setIsHidden(true);

    const data = await handleFetch(gen);

    setSprite(data.sprites.front_default);
    setName(data.name);
    setIsLoading(false);
    readAloud(WHO_IS_THAT_POKEMON);
  };

  const handleGuess = event => {
    setGuess(event.target.value.toLowerCase());
  };

  const handleReveal = () => {
    if (isHidden) {
      setIsHidden(false);
    }

    readAloud(`It's... ${name}!`);
  };

  return (
    <div>
      <details>
        <summary>SETTINGS</summary>

        <form>
          <fieldset>
            <legend>THEME</legend>

            <div>
              <input
                type="radio"
                id="light"
                name="isDark"
                value="false"
                checked={!isDark}
                onChange={handleIsDark}
              />

              <label htmlFor="light">Light</label>

              <input
                type="radio"
                id="dark"
                name="isDark"
                value="true"
                checked={isDark}
                onChange={handleIsDark}
              />

              <label htmlFor="dark">Dark</label>
            </div>
          </fieldset>

          <fieldset>
            <legend>AUDIO</legend>

            <div>
              <input
                type="radio"
                id="on"
                name="isMuted"
                value="false"
                checked={!isMuted}
                onChange={handleIsMuted}
              />

              <label htmlFor="on">On</label>

              <input
                type="radio"
                id="off"
                name="isMuted"
                value="true"
                checked={isMuted}
                onChange={handleIsMuted}
              />

              <label htmlFor="off">Off</label>
            </div>
          </fieldset>

          <fieldset>
            <legend>MODE</legend>

            <div>
              <input
                type="radio"
                id="trainer"
                name="isMaster"
                value="false"
                checked={!isMaster}
                onChange={handleIsMaster}
              />

              <label htmlFor="trainer">Trainer</label>

              <input
                type="radio"
                id="master"
                name="isMaster"
                value="true"
                checked={isMaster}
                onChange={handleIsMaster}
              />

              <label htmlFor="master">Master</label>
            </div>
          </fieldset>

          <fieldset>
            <legend>GENERATION</legend>

            <div>
              <select
                id="gen"
                onChange={handleGen}
              >
                <option value="I-IX">Gens I-IX</option>
                <option value="I-VIII">Gens I-VIII</option>
                <option value="I-VII">Gens I-VII</option>
                <option value="I-VI">Gens I-VI</option>
                <option value="I-V">Gens I-V</option>
                <option value="I-IV">Gens I-IV</option>
                <option value="I-III">Gens I-III</option>
                <option value="I-II">Gens I-II</option>
                <option value="I">Gen I</option>
                <option value="II">Gen II</option>
                <option value="III">Gen III</option>
                <option value="IV">Gen IV</option>
                <option value="V">Gen V</option>
                <option value="VI">Gen VI</option>
                <option value="VII">Gen VII</option>
                <option value="VIII">Gen VIII</option>
                <option value="IX">Gen IX</option>
              </select>
            </div>
          </fieldset>
        </form>
      </details>

      <h1>Who's that Pokemon?</h1>

      <div>
        {
          isLoading && <img
            className="preloader"
            src={`${process.env.PUBLIC_URL}/images/preloader.gif`}
            alt="preloader"
          />
        }

        {
          sprite && <img
            className={isHidden ? 'silhouette' : 'sprite'}
            src={sprite}
            alt={isHidden ? 'silhouette' : 'sprite'}
            onClick={handleReveal}
          />
        }
      </div>

      <button onClick={handleReveal}>REVEAL</button>

      <button onClick={handleGenerate}>GENERATE</button>

      {isMaster &&
        <form>
          <fieldset>
            <legend>GUESS</legend>

            <div>
              <input
                type="text"
                id="guess"
                name="guess"
                value={guess}
                disabled={!isHidden || guess === name}
                onChange={handleGuess}
              ></input>
            </div>
          </fieldset>
        </form>
      }

      {!isHidden && name && <h2>It's... {capitalizeFirstLetter(name)}!</h2>}
    </div>
  );
};

// Exports
export default WhoIsThatPokemon;
