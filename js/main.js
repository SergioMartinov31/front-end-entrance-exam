/*jshint esversion: 6 */
/*globals html2pdf */

document.addEventListener("DOMContentLoaded", function () {
  var editableElements = document.querySelectorAll(
    "span, h2, h3, h4, p, li, a",
  );

  Array.prototype.forEach.call(editableElements, function (element) {
    if (element.closest("button") || element.classList.contains("no-edit")) {
      return;
    }

    element.style.cursor = "pointer";

    element.addEventListener("click", function () {
      if (this.getAttribute("contenteditable") === "true") {
        return;
      }

      this.setAttribute("contenteditable", "true");
      this.focus();

      var originalText = this.textContent;

      function handleBlur() {
        this.setAttribute("contenteditable", "false");

        if (this.textContent !== originalText) {
          this.classList.add("text-changed");
          setTimeout(
            function () {
              this.classList.remove("text-changed");
            }.bind(this),
            1000,
          );
        }

        this.removeEventListener("blur", handleBlur);
        this.removeEventListener("keydown", handleKeyDown);
      }

      function handleKeyDown(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          this.blur();
        }
      }

      this.addEventListener("blur", handleBlur);
      this.addEventListener("keydown", handleKeyDown);
    });
  });

  var downloadBtn = document.querySelector(".footer__download");
  if (downloadBtn) {
    downloadBtn.setAttribute("data-ripple", "");
    downloadBtn.addEventListener("click", function (e) {
      e.preventDefault();
      generatePDF();
    });
  }

  document.addEventListener("click", function (e) {
    var target = e.target.closest("[data-ripple]");
    if (!target || target.hasAttribute("contenteditable")) return;

    var rect = target.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var x = e.clientX - rect.left - size / 2;
    var y = e.clientY - rect.top - size / 2;

    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    var existingRipples = target.querySelectorAll(".ripple");
    Array.prototype.forEach.call(existingRipples, function (r) {
      r.remove();
    });

    target.appendChild(ripple);

    setTimeout(function () {
      ripple.remove();
    }, 600);
  });
});

function generatePDF() {
  var element = document.querySelector(".body-container");
  var button = document.querySelector(".footer__download");

  var opt = {
    margin: 10,
    filename: "my-resume.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  button.textContent = "Generating PDF...";
  button.disabled = true;

  if (typeof html2pdf !== "undefined") {
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(function () {
        button.textContent = "Download PDF resume";
        button.disabled = false;
      })
      .catch(function (error) {
        console.error("PDF generation error:", error);
        button.textContent = "Error! Try again";
        setTimeout(function () {
          button.textContent = "Download PDF resume";
          button.disabled = false;
        }, 2000);
      });
  } else {
    console.error("html2pdf is not defined");
    button.textContent = "Error: Library not loaded";
    button.disabled = false;
  }
}
