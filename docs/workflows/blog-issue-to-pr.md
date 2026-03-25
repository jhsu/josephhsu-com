# Blog issue to PR workflow

This repo keeps published posts in `src/data/blog-posts/` as one Markdown file per post slug.

## Flow

1. A GitHub issue is opened with the post idea, title, and source notes.
2. GitHub Actions builds a Codex prompt from `.github/codex/prompts/blog-post.md` plus the issue payload.
3. `openai/codex-action@v1` runs Codex in the repo checkout and drafts the post.
4. The workflow validates the site build, commits the draft, and opens a pull request.

## Post layout

- Markdown file: `src/data/blog-posts/<slug>.md`
- Asset folder: `src/data/blog-posts/<slug>/`
- Frontmatter should include `title`, `slug`, `publishDate`, and `description`.

## Writing voice

Use the existing blog voice from `WRITING_GUIDE.md`: grounded, specific, lightly enthusiastic, and practical.

## Implementation notes

- Keep the GitHub Actions job thin.
- Use `safety-strategy: drop-sudo` and `sandbox: workspace-write`.
- Use the issue number as the branch suffix and review anchor.
- Ignore bot-authored events to avoid loops.
