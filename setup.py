from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in auto_bank_reconciliation/__init__.py
from auto_bank_reconciliation import __version__ as version

setup(
	name="auto_bank_reconciliation",
	version=version,
	description="This app automatically reconciles the transcations",
	author="Dexciss Technologies Pvt Ltd",
	author_email="support@dexciss.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
