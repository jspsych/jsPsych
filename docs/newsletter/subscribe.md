# Subscribe to our newsletter

Subscribe to our newsletter to stay up to date with the latest news and updates from the jsPsych team.
We send out newsletters about once a month.
The newsletter includes information about new releases, upcoming events, community spotlights, and other news related to jsPsych.
You can unsubscribe at any time.


<form method="post" name="subscribeform" id="subscribeform" enctype="multipart/form-data"> 
<input type="email" name="email" placeholder="Email address" id="email" size="40" class="md-input" required>
<input type="hidden" name="htmlemail" value="1"> 
<input type="hidden" name="list[2]" value="signup" /> 
<input type="hidden" name="subscribe" value="subscribe"/> 
<button class='md-button md-button--primary' onclick="if (checkform()) {submitForm();} return false;" id="subscribe">Subscribe</button> 
<div id="result"></div> 
</form>

<script type="text/javascript"> 

  function checkform() { 
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;    
    const emailInput = document.getElementById("email");
    const resultDiv = document.getElementById("result");
    
    if (!re.test(emailInput.value)) {
        resultDiv.innerHTML = "Please enter a valid email address";
        emailInput.focus();
        return false;
    }
    return true;
  } 

  async function submitForm() { 
    const emailInput = document.getElementById("email");
    const successMessage = 'Thank you for your registration. Please check your email to confirm.'; 
    const url = 'https://mail.jspsych.org/?p=asubscribe&id=6';
    const resultDiv = document.getElementById("result");
    const subscribeButton = document.querySelector('button#subscribe');

    // Disable the subscribe button
    subscribeButton.disabled = true;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Adjust based on your content type
        },
        body: new URLSearchParams(new FormData(document.getElementById('subscribeform'))),
      });

      const data = await response.text();
      resultDiv.innerHTML = successMessage;
    } catch (error) {
      resultDiv.innerHTML = 'An error occurred. Please try again later.';
    } finally {
      // Re-enable the subscribe button
      subscribeButton.disabled = false;
    }
  }

  document.querySelector('button#subscribe').addEventListener('click', submitForm);
</script>
