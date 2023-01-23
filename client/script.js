import bot from './assets/bot.svg'
import user from './assets/user.svg'


const form = document.querySelector('form'); // this is our only form in the html so we don't need it to have an ID.
const chatContainer = document.querySelector('#chat_container');

let loadInterval

function loader(element) {
  element.textContent = ''; // We insure that the element is empty at the start

  loadInterval = setInterval(() => {
      // Add one more dot to to the loading indicator
      element.textContent += '.';

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300); // We want this function to occur every 300 milliseconds
}



// This function will have a type affect when we get the response from the AI
function typeText(element, text) {
  let index = 0; // We use it to load the letters 1 by 1 until index will be equals to text.length

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index);
          index++;
      } else {
          clearInterval(interval); 
      }
  }, 20)
}

// Generate unique ID for each message div of bot
// Necessary for typing text effect for that specific reply
// Without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now(); // The time is allways unique so it helps to generate a unique ID
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16); // We want to make it even more random by 
  // Combining the timestamp and the hexadecimalString

  return `id-${timestamp}-${hexadecimalString}`;
}


// isAi is a parameter that signifies whether AI is speaking or the user
// value is the value of the message
function chatStripe(isAi, value, uniqueId) {
  return (

      `
      <div class="wrapper ${isAi && 'ai'}"> 
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault(); // Usually when you submit a form the browser refreshes the page
  // preventDefault() will prevent the browser default behavier which means the browser will not refresh the page

  // Data will be equals to the data that was typed into the form
  const data = new FormData(form);

  // User's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt')); // false means it's not the AI it's the user

  // To clear the textarea input 
  form.reset();

  // Bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  // true means it's the AI, the empty string will be filled when the loader() functions will be called

  // To focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Specific message div 
  const messageDiv = document.getElementById(uniqueId);

  // MessageDiv.innerHTML = "..."
  loader(messageDiv);

  
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = " "

  if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim(); // trims any trailing spaces/'\n' 

      typeText(messageDiv, parsedData);
  } else {
      const err = await response.text()

      messageDiv.innerHTML = "Something went wrong"
      alert(err)
  }
    
}


// Call handleSubmit() when we press the submit button with the mouse or when we press the ENTER key
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})