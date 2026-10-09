(function () {
  "use strict";

  // ---- Breed data ---------------------------------------------------------
  // Add or edit breeds freely. Each needs: name, tagline, traits (3), quirk.
  var BREEDS = [
    {
      name: "Siamese",
      tagline: "Chatty, devoted, and never shy about an opinion.",
      traits: ["you always have something to say", "you bond intensely with your people", "you notice everything happening in the room"],
      quirk: "Siamese cats narrate their day out loud, and so, we suspect, do you."
    },
    {
      name: "Maine Coon",
      tagline: "A gentle giant with a big heart.",
      traits: ["you're warm and easygoing", "you take up more emotional space than you realize, in a good way", "you make everyone around you feel safe"],
      quirk: "Maine Coons chirp instead of meowing, a sound as unexpectedly sweet as your best moments."
    },
    {
      name: "Persian",
      tagline: "Elegant, calm, and happiest when things are cozy.",
      traits: ["you have refined taste", "you prefer a peaceful afternoon to a chaotic one", "you're at your best when you're comfortable"],
      quirk: "Persians treat a good lap or a sunbeam as a serious life goal. Fair."
    },
    {
      name: "Bengal",
      tagline: "Energetic, adventurous, and always up to something.",
      traits: ["you can't sit still for long", "you turn ordinary days into adventures", "you're curious about how everything works"],
      quirk: "Bengals will happily play in water, and you probably say yes to unusual invitations too."
    },
    {
      name: "Ragdoll",
      tagline: "Sweet, relaxed, and impossible to rattle.",
      traits: ["you go with the flow", "you're the friend everyone feels calm around", "you give great hugs"],
      quirk: "Ragdolls go limp when picked up, which is basically the most trusting thing a cat can do."
    },
    {
      name: "Sphynx",
      tagline: "Bold, expressive, and completely unbothered by convention.",
      traits: ["you do things your own way", "you're warm-hearted under a confident exterior", "you love being the center of attention"],
      quirk: "Sphynx cats seek out warmth and company, and they will absolutely follow you around the house."
    },
    {
      name: "Scottish Fold",
      tagline: "Sweet-natured, quietly funny, and a little bit goofy.",
      traits: ["you have a wonderfully dry sense of humor", "you're friendly without being loud about it", "you charm people without trying"],
      quirk: "Scottish Folds are famous for sitting in odd, human-like poses, and you've definitely had your own odd-pose moments."
    },
    {
      name: "Russian Blue",
      tagline: "Reserved at first, fiercely loyal once you know them.",
      traits: ["you take your time deciding whom to trust", "you're thoughtful and observant", "you're calm in a crisis"],
      quirk: "Russian Blues greet their favorite person at the door, and you'd do the same for the right friend."
    },
    {
      name: "Abyssinian",
      tagline: "Playful, clever, and always on the move.",
      traits: ["you're quick on your feet and quicker with ideas", "you love a good project", "you'd rather be exploring than sitting around"],
      quirk: "Abyssinians climb to the highest spot in the room just to see everything, a very you move."
    },
    {
      name: "British Shorthair",
      tagline: "Steady, dependable, and quietly lovable.",
      traits: ["you're the dependable one", "you like your routines and your snacks", "you show affection by simply being there"],
      quirk: "British Shorthairs prefer sitting next to you over sitting on you, which is a pretty classy way to show love."
    },
    {
      name: "Norwegian Forest Cat",
      tagline: "Rugged, resourceful, and happiest outdoors.",
      traits: ["you're tougher than you look", "you can handle whatever the weather throws at you", "you love a good climb"],
      quirk: "Norwegian Forest Cats are skilled climbers who can come down trees headfirst, and you also like doing things the confident way."
    }
  ];

  // ---- Helpers ------------------------------------------------------------

  // FNV-1a hash: the same string always gives the same number.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function normalize(name) {
    return name.trim().replace(/\s+/g, " ").toLowerCase();
  }

  function titleCase(name) {
    return name.trim().replace(/\s+/g, " ").replace(/(^|[\s'-])(\p{L})/gu, function (_, sep, ch) {
      return sep + ch.toUpperCase();
    });
  }

  // A sentence about the name itself, chosen by a simple property of the name.
  function nameObservation(display) {
    var letters = display.replace(/[^\p{L}]/gu, "");
    var len = letters.length;
    var vowels = (letters.match(/[aeiouy]/gi) || []).length;
    var first = letters.charAt(0).toUpperCase();
    var last = letters.charAt(len - 1).toLowerCase();

    if (len <= 4) {
      return "Your name is short and punchy, the kind of name that gets right to the point.";
    }
    if (len >= 10) {
      return "Your name has " + len + " letters, which tells us you like to take your time and make an entrance.";
    }
    if (vowels / len >= 0.5) {
      return "Your name is full of soft, flowing vowels, a very smooth, purr-like sound.";
    }
    if (vowels / len <= 0.25) {
      return "Your name has a crisp, no-nonsense rhythm, with " + (len - vowels) + " consonants doing the heavy lifting.";
    }
    if (first <= "H") {
      return "Your name starts with \"" + first + "\", early in the alphabet, so you're probably used to being first in line.";
    }
    if (last === "a" || last === "e" || last === "y") {
      return "Your name ends on a light, open note, which suggests an easy, friendly spirit.";
    }
    return "Your name has a balanced, steady sound, the sort that people remember.";
  }

  // ---- Matching -----------------------------------------------------------

  function match(rawName) {
    var key = normalize(rawName);
    var h = hash(key);
    var breed = BREEDS[h % BREEDS.length];
    // A second, different slice of the hash picks which trait to highlight.
    var trait = breed.traits[Math.floor(h / BREEDS.length) % breed.traits.length];
    var display = titleCase(rawName);

    var why =
      nameObservation(display) + " That's very " + breed.name + ": " +
      trait + ". " + breed.quirk;

    return { display: display, breed: breed, why: why };
  }

  // ---- UI -----------------------------------------------------------------

  var form = document.getElementById("name-form");
  var input = document.getElementById("name-input");
  var errorEl = document.getElementById("error");
  var resultEl = document.getElementById("result");
  var resetBtn = document.getElementById("reset");

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorEl.hidden = true;

    var value = input.value.trim();
    if (!/\p{L}/u.test(value)) {
      showError("Enter a name that includes at least one letter.");
      return;
    }

    var r = match(value);
    document.getElementById("result-name").textContent = r.display;
    document.getElementById("breed-name").textContent = r.breed.name;
    document.getElementById("breed-tagline").textContent = r.breed.tagline;
    document.getElementById("breed-why").textContent = r.why;
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", function () {
    resultEl.hidden = true;
    errorEl.hidden = true;
    input.value = "";
    input.focus();
  });
})();
