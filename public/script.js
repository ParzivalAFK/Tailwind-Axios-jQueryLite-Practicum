document.addEventListener('DOMContentLoaded', function () {
  const courseSelect = document.getElementById('course');
  const uvuIdInput = document.getElementById('uvuId');
  uvuIdInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });
  const uvuIdLabel = document.getElementById('uvuIdLabel');
  const logsList = document.querySelector('[data-cy="logs"]');
  const addLogBtn = document.querySelector('[data-cy="add_log_btn"]');
  const logTextarea = document.querySelector('[data-cy="log_textarea"]');

  fetch('https://json-server-jnx3nx--3000.local.webcontainer.io/api/v1/courses')
    .then((response) => response.json())
    .then((courses) => {
      courses.forEach((course) => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.display;
        courseSelect.appendChild(option);
      });
    });

  courseSelect.addEventListener('change', function () {
    if (this.value) {
      uvuIdInput.style.display = 'inline-block';
      uvuIdLabel.style.display = 'inline-block';
    } else {
      uvuIdInput.style.display = 'none';
      uvuIdLabel.style.display = 'none';
    }
  });

  uvuIdInput.addEventListener('input', function () {
    if (this.value.length === 8 && /^\d{8}$/.test(this.value)) {
      fetch(
        `https://json-server-jnx3nx--3000.local.webcontainer.io/logs?courseId=${courseSelect.value}&uvuId=${this.value}`
      )
        .then((response) => response.json())
        .then((logs) => {
          logsList.innerHTML = '';
          logs.forEach((log) => {
            const li = document.createElement('li');
            li.innerHTML = `
                          <div><small>${log.date}</small></div>
                          <pre><p>${log.text}</p></pre>
                      `;
            logsList.appendChild(li);
          });
        });
    }
  });

  logsList.addEventListener('click', function (event) {
    if (event.target.closest('li')) {
      const logText = event.target.closest('li').querySelector('p');
      if (logText.style.display === 'none') {
        logText.style.display = 'block';
      } else {
        logText.style.display = 'none';
      }
    }
  });

  logTextarea.addEventListener('input', function () {
    addLogBtn.disabled = !(this.value && logsList.children.length);
  });

  addLogBtn.addEventListener('click', async function (e) {
    console.log('Test Text 3');
    e.preventDefault();

    const selectedCourseId = courseSelect.value;
    const enteredUvuId = uvuIdInput.value;
    const currentDate = new Date();
    const data = {
      courseId: selectedCourseId,
      uvuId: enteredUvuId,
      date: currentDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      }),
      text: logTextarea.value.trim(),
    };

    try {
      console.log('Test Text 1');
      const response = await fetch(
        'https://json-server-jnx3nx--3000.local.webcontainer.io/api/v1/logs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      if (response.ok) {
        console.log('Test Text 2');
        logTextarea.value = '';

        const li = document.createElement('li');
        li.innerHTML = `
                <div><small>${data.date}</small></div>
                <pre><p>${data.text}</p></pre>
            `;
        logsList.appendChild(li);
      } else {
        throw new Error('Failed to save log');
      }
    } catch (error) {
      console.error(error);
    }
  });
});
