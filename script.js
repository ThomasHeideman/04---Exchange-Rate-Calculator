let currencyEl_one = document.getElementById('currency-one');
let currencyEl_two = document.getElementById('currency-two');
const amountEl_one = document.getElementById('amount-one');
const amountEl_two = document.getElementById('amount-two');
const rateEl = document.getElementById('rate');
const swap = document.getElementById('swap');

const flagOne = document.getElementById('flag-one');
const flagTwo = document.getElementById('flag-two');
const customFlags = {
  EUR: 'https://flagcdn.com/96x72/eu.png',
  // Voeg hier andere valuta's en hun vlaggen toe indien nodig
};

async function fetchCountryData() {
  const response = await fetch(
    'countryapi.json'
    // 'https://countryapi.io/api/all?apikey=EdjEtLVk5aohjjXvrxzfYr9rmPN5jATYGvfxEu52'
  );
  const data = await response.json();
  console.log(data);
  return data;
}
async function fetchCurrencyData() {
  const response = await fetch(
    'exchangerate-api.json'
    // 'https://v6.exchangerate-api.com/v6/1f948c4d90c0769df922fe3b/latest/EUR'
    // 'https://v6.exchangerate-api.com/v6/85be4117daa5b06bf7e3b8d2/latest/EUR'
  );
  const data = await response.json();
  const conversion_data = data.conversion_rates;
  return conversion_data;
}

async function populateCurrencyDropdowns() {
  const conversion_data = await fetchCurrencyData();
  const currencies = Object.keys(conversion_data);

  // Fetch Country data
  const country_data = await fetchCountryData();

  currencies.forEach(currency => {
    const country = Object.values(country_data).find(
      country => country.currencies && country.currencies[currency]
    );

    let symbol = '';
    if (country && country.currencies[currency]) {
      symbol = country.currencies[currency].symbol || '';
    }
    const flagUrl = country ? country.flag.medium : '';

    const optionEl_one = document.createElement('option');
    optionEl_one.value = currency;
    optionEl_one.textContent = `${currency}${symbol ? ` (${symbol})` : ''}`;

    const optionEl_two = optionEl_one.cloneNode(true);
    currencyEl_one.appendChild(optionEl_one);
    currencyEl_two.appendChild(optionEl_two);
  });

  currencyEl_one.value = 'EUR'; // Set the default 'From' currency
  currencyEl_two.value = 'CAD'; // Set the default 'To' currency
  await updateFlags();
  calculate();
}

async function calculate() {
  const conversion_data = await fetchCurrencyData();

  const currency_one = currencyEl_one.value;
  const currency_two = currencyEl_two.value;
  const rate = conversion_data[currency_two] / conversion_data[currency_one];
  rateEl.innerText = `1 ${currency_one} = ${rate.toFixed(4)} ${currency_two}`;
  amountEl_two.value = (amountEl_one.value * rate).toFixed(2);
  await updateFlags();
}

async function calculateReverse() {
  const conversion_data = await fetchCurrencyData();

  const currency_one = currencyEl_one.value;
  const currency_two = currencyEl_two.value;
  const rate = conversion_data[currency_two];
  rateEl.textContent = `1 ${currency_one} = ${rate.toFixed(4)} ${currency_two}`;
  amountEl_one.value = (amountEl_two.value * rate).toFixed(2);
  await updateFlags();
}

async function updateFlags() {
  const country_data = await fetchCountryData();
  const currency_one = currencyEl_one.value;
  const currency_two = currencyEl_two.value;

  // Controleer of er een custom flag is voor de eerste valuta
  if (customFlags[currency_one]) {
    flagOne.src = customFlags[currency_one];
  } else {
    const country_one = Object.values(country_data).find(
      country => country.currencies && country.currencies[currency_one]
    );
    if (country_one) {
      flagOne.src = country_one.flag.medium;
    }
  }

  // Controleer of er een custom flag is voor de tweede valuta
  if (customFlags[currency_two]) {
    flagTwo.src = customFlags[currency_two];
  } else {
    const country_two = Object.values(country_data).find(
      country => country.currencies && country.currencies[currency_two]
    );
    if (country_two) {
      flagTwo.src = country_two.flag.medium;
    }
  }
}

async function swapRates() {
  [currencyEl_one.value, currencyEl_two.value] = [
    currencyEl_two.value,
    currencyEl_one.value,
  ];
  await updateFlags();
  calculate();
}

// Event listeners
currencyEl_one.addEventListener('change', calculate);
currencyEl_two.addEventListener('change', calculate);
amountEl_one.addEventListener('input', calculate);
amountEl_two.addEventListener('input', calculateReverse);
swap.addEventListener('click', swapRates);

populateCurrencyDropdowns();
