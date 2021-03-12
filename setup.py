#!/usr/bin/env python

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name="kncyber-pl",
    version="1.0.0",
    description="The website, duh.",
    author="KNCyber",
    author_email="root@kncyber.pl",
    license="AGPLv3",
    include_package_data=True,
    install_requires=open("requirements.txt").read().splitlines(),
    zip_safe=False,  # https://mypy.readthedocs.io/en/latest/installed_packages.html#making-pep-561-compatible-packages
    classifiers=["Programming Language :: Python"]
)
