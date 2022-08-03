# Copyright (c) 2022, Dexciss Technologies Pvt Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class BankReconciliation(Document):

	def on_submit(self):
		print(" we are submitting  00000000000000000000")
		for b in self.bank_reconciliation_entries :	
			if b.get("rec") == 1:
				frappe.db.set_value('Payment Entry', b.get("payment_entry"), 'rec', 1, update_modified=False)

		for s in self.bank_statement_import_view:
			print(" inside rec 22222222222222222")
			if s.get("rec") == 1:
				print(" inside rec 22222222222222222")
				frappe.db.set_value('Bank Statement', s.get("name1"), 'rec', 1, update_modified=False)
		
	
	@frappe.whitelist()
	def get_all_transcations(self):
		print(" get_all_transcations called")

		trans = []
		if self.include_reconciled_trans == 1:
			trans = frappe.get_all("Payment Entry", {"posting_date": ["Between", [self.period_from, self.period_to]], "docstatus": 1 }, ["*"])
		else:

			trans = frappe.get_all("Payment Entry", {"posting_date": ["Between", [self.period_from, self.period_to]], r"rec":0, "docstatus": 1 }, ["*"])
		# print(" this are transcations", trans)
		if trans:
			for t in trans:
				print(" this is t", t)
				self.append(
					"bank_reconciliation_entries",{
						"posting_date": t.get("posting_date"),
						"party_type": t.get("party_type"),
						"party" : t.get("party"),
						"party_name": t.get("party_name"),
						"payment_entry": t.get("name"),
						"receipt": t.get("paid_amount") if t.get("payment_type") == "Receive" else 0,
						"payment": t.get("paid_amount") if t.get("payment_type") == "Pay" else 0 ,
						"rec": t.get('rec'),
						"ref_no": t.get("reference_no"),
						"reference_date": t.get("reference_date"),
						"amount":  t.get("paid_amount")
					}
				)




	@frappe.whitelist()
	def get_reconsiling_entries(self):
		print(" 'get_reconsiling_entries', called")	

		trans = []
		if self.include_reconciled_trans == 1: 
			trans = frappe.get_all("Bank Statement", {"posting_date": ["Between", [self.period_from, self.period_to]]}, ["*"])
		else:
			trans = frappe.get_all("Bank Statement", {"posting_date": ["Between", [self.period_from, self.period_to]], r"rec":0 }, ["*"])
		if trans:
			for t in trans:
				self.append("bank_statement_import_view",{
					"posting_date": t.get("posting_date"),
					"name1" : t.get("name"),
					"transaction_description": t.get("transaction_description"),
					"reference": t.get("reference"),
					"type": t.get("type"),
					"withdrawal": t.get("withdrawal"),
					"deposit" : t.get("deposit"),
					"rec" : t.get("rec"),
					"amount": t.get("withdrawal") if t.get("withdrawal") else t.get("deposit"),
					"party_name" : t.get("name1")
				})

	@frappe.whitelist()
	def get_unpresented_cheque(self):
		
		sum_deposit = sum_withdraw = un_rpay = un_rec = r_bbal = r_diff = 0  
		print(" this is get_unpresented_cheque")	
		for s in self.bank_reconciliation_entries :
			sum_deposit = sum_deposit + s.get("receipt") 
			sum_withdraw = sum_withdraw + s.get("payment")
	
			print(" this is common 2222222222222222222222" )
			mode = frappe.get_doc("Payment Entry", s.get("payment_entry"))

			
			
			if mode.get("mode_of_payment") == "Cheque" and mode.get("payment_type") == "Pay" and s.get('rec') == 0:
				un_rpay = un_rpay + mode.get("paid_amount")
				print(" this is referec nooooooooooooooooooo", mode.get("reference_no"))
				self.append("list_of_unpresented_cheques",{
					"posting_date": mode.get("posting_date"),
					"name1": mode.get("name"),
					"transaction_description": mode.get("reference_no"),
					"type": mode.get("payment_type") ,
					"amount" : mode.get("paid_amount")
				})
				
			if mode.get("mode_of_payment") == "Cheque" and mode.get("payment_type") == "Receive" and s.get('rec') == 0:
				un_rec = un_rec + mode.get("paid_amount")
				print(" this is referec nooooooooooooooooooo", mode.get("reference_no"))
				self.append("list_of_uncredited_cheques",{
					"posting_date": mode.get("posting_date"),
					"name1": mode.get("name"),
					"transaction_description": mode.get("reference_no"),
					"type": mode.get("payment_type") ,
					"amount" : mode.get("paid_amount")
				})	

			if s.get("rec") == 1 and mode:
				r_bbal = r_bbal + mode.get("paid_amount")

		self.balance_per_bank_statement = sum_deposit - sum_withdraw
		self.unreconciled_payment = un_rpay
		self.unreconciled_receipt = un_rec
		self.reconciling_different = un_rpay - r_bbal
		self.reconciled_bank_balance = r_bbal
		

	@frappe.whitelist()
	def match_table_one_two(self):
		print(" this is match table one two ")

		if self.reco_criteria == "Reference and Amount":
			print(" this is one 111111111111111111 ")
			for b in self.bank_reconciliation_entries :	
				for s in self.bank_statement_import_view:
					if b.get("ref_no") == s.get("reference") and b.get("amount") == s.get("amount") :
						b.rec = s.rec = 1

		elif self.reco_criteria == "Date and Amount":
			print(" this is two 22222222222")
			for b in self.bank_reconciliation_entries :	
				for s in self.bank_statement_import_view:
					if b.get("posting_date") == s.get("posting_date") and b.get("amount") == s.get("amount") :
						b.rec = s.rec = 1

		else: 
			print(" this is three 3333333333333")
			for b in self.bank_reconciliation_entries :	
				for s in self.bank_statement_import_view:
					if b.get("party_name") == s.get("party_name") and b.get("amount") == s.get("amount") :
						b.rec = s.rec = 1				

	@frappe.whitelist()
	def direct_withdraw(self):
		total = 0
		print(" this is match table one two ")
		for s in self.bank_statement_import_view:
			# print(" this is s dw")
			if s.withdrawal > 0 and s.rec == 0:
				print(" this is s withda")
				total = total +  s.withdrawal
				self.append("list_of_direct_withdrawal",{
					"posting_date": s.get("posting_date"),
					"description": s.get("transcation_description"),
					"account_type": "",
					"party": s.get("party_name"),
					"account_name": "",
					"amount": s.get("withdrawal"),
					"ref": s.get("reference"),
					"ref_date" : "",
					"remarks": ""
				})

		self.total_direct_withdrawal = total		

	@frappe.whitelist()
	def direct_lodgment(self):
		total = 0
		print(" this is match table one two ")	
		for s in self.bank_statement_import_view:
			print(" this is s dl")
			if s.deposit > 0 and s.rec == 0:
				total = total +  s.deposit
				print(" this is deosite")
				self.append("list_of_direct_lodgment",{
					"posting_date": s.get("posting_date"),
					"description": s.get("transcation_description"),
					"account_type": "",
					"party": s.get("party_name"),
					"account_name": "",
					"amount": s.get("deposit"),
					"ref": s.get("reference"),
					"ref_date" : "",
					"remarks": ""
				})

		self.total_direct_lodgment = total	