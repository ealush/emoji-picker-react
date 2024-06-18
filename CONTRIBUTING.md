# Contributing to Emoji Picker React

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
>
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#join-the-project-team)

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](https://github.com/ealush/emoji-picker-react/blob/master/README.md#usage).

Before you ask a question, it is best to search for existing [Issues](https://github.com/ealush/emoji-picker-react/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/ealush/emoji-picker-react/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

## I Want To Contribute

> ### Legal Notice
>
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project licence.

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the [documentation](https://github.com/ealush/emoji-picker-react/blob/master/README.md#usage). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](https://github.com/ealush/emoji-picker-react/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Possibly your input and the output
  - Can you reliably reproduce the issue? And can you also reproduce it with older versions?

#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to <code@ealush.com>.

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/ealush/emoji-picker-react/issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behaviour you would expect and the actual behaviour.
- Please provide as much context as possible and describe the _reproduction steps_ that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Emoji Picker React, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the [documentation](https://github.com/ealush/emoji-picker-react/blob/master/README.md#usage) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/ealush/emoji-picker-react/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/ealush/emoji-picker-react/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behaviour** and **explain which behaviour you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to. You can use [this tool](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
- **Explain why this enhancement would be useful** to most Emoji Picker React users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

### Your First Code Contribution

Mention one of the maintainers in a new comment in an open issue, and request to be assigned to it.

After you received a confirmation of being assigned for an issue, you can continue to the next steps.

#### Configure Your Environment

Before you get started, make sure you have the following requirements in place:

- [Git](https://git-scm.com/downloads)

- [Node.js 16.x](https://nodejs.org/en/download/releases/)

  Use the `node --version` command to check your version.

  > **Notice:** You can use Node.js 18.x or above for building and using the project, but you must test it on Storybook with Node.js 16.x! It's recommended to have a tool like [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) to change between different Node.js versions.

#### Setup the Project

1. Fork the repo from [GitHub](https://github.com/ealush/emoji-picker-react), and clone it to your local development environment, with the following Git command:

   _Make sure you <u>replace</u> `<username>` with <u>your GitHub username</u>!_

   ```bash
   git clone https://github.com/<username>/emoji-picker-react.git
   ```

2. Checkout to a new branch by running the following command in the repository root:

   _Make sure you <u>replace</u> `<branch>` with <u>your new branch name</u>!<br />It can be the name of the feature you're adding or the bug you're fixing._

   ```bash
   git checkout -b <branch>
   ```

3. Install all the necessary dependencies using:

   ```bash
   yarn install
   ```

#### Write & Test Changes to the Code

1. In the repository root, run the following command:

   ```bash
   yarn run storybook
   ```

2. If all the installation process is succeed, you should be able to see the Storybook webpage on [localhost:6006](http://localhost:6006/).

3. Add features or resolve issues by changing the code, save it, and test it by seeing your changes on Storybook.

#### Commit the Changes to Git

1. When you resolved your issue, commit the changes you've made by running:

   _Make sure you <u>replace</u> `<message>` with a descripted short message of the changes you've made!_

   ```bash
   git add .
   git commit -m "<message>"
   ```

2. Push the changes to Git:

   _Make sure you <u>replace</u> `<branch>` with <u>the branch name you previously created</u>!_

   ```bash
   git push -u origin <branch>
   ```

3. Learn more about Git commands in [Git Guides on GitHub](https://github.com/git-guides).

#### Submit a Pull Request

1. Go to the [compare changes page](https://github.com/ealush/emoji-picker-react/compare) in the project's GitHub repository.

2. Click on the <u>"compare across forks"</u> link, under "Compare changes" header.

3. In the <u>right side</u> of the arrow, select the repository under <u>your GitHub username</u> in the <u>"head repository"</u> input, and change the <u>"compare"</u> branch input, the branch name you chose previously.

4. Click on "Create pull request".

5. Write a descripted title.

6. Write what issue this pull request attempting to close, by writing one of the following keywords `closes`, `fixes`, or `resolves`, followed by the issue reference number (for example, `#123`).

7. Write what changes you've made within this branch.

8. Write what tests you've done.

9. Submit the pull request!

**Well done!**

Now wait for a code review from the maintainers.

After reviewing your code, it will be merged with the master branch, and you'll get approved for being a contributor of the project!

Thank you so much! We hope to see you contributing more in the future!
