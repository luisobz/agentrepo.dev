# GCP audit checks

`python3 -m unittest discover -s tests/gcp -p 'test_*.py'` uses a synthetic gcloud
executable and temporary local files. It never authenticates or accesses GCP.
The execute-path tests set `--max-metrics 0`; the plan test does not invoke any
CLI. Tests cover bounded inventory flags, private files, no-overwrite and
symbolic-link handling, project validation, invalid numbers and cost scoping.

These tests do not establish real IAM coverage, API availability, regional
inventory completeness or the accuracy of a savings recommendation. Validate
those in an explicitly authorized project before relying on an actual audit.
