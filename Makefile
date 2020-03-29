.PHONY: start
start:
	python3 -m http.server --bind localhost 8000 --directory demo

.PHONY: format
format:
	prettier --write .
