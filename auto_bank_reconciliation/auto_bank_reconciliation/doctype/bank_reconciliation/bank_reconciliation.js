// Copyright (c) 2022, Dexciss Technologies Pvt Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bank Reconciliation', {

	

	refresh: function(frm) {
		
		
		// Custom buttons in groups
		if (frm.doc.docstatus == 0){
			frm.add_custom_button('Get All Transactions', () => {
				console.log("Get All Transcations Button Clicked ")
				if (frm.doc.status != 1) {
					frm.clear_table("bank_reconciliation_entries")
					frm.call({
						doc: frm.doc,
						method: 'get_all_transcations',
						
						freeze: true,
						freeze_message: __('Adding Reconsiling Entries'),
						callback: function() {
							frm.refresh_field('bank_reconciliation_entries');
						}
					});
				}
			}, 'Get Transaction');

			frm.add_custom_button('Get Reconsiling Entries', () => {
				console.log("Get Reconsiling Entries Button Clicked ")
				frm.clear_table("bank_statement_import_view")
				if (frm.doc.status != 1) {
					frm.call({
						doc: frm.doc,
						method: 'get_reconsiling_entries',
						
						freeze: true,
						freeze_message: __('Adding Reconsiling Entries'),
						callback: function() {
							frm.refresh_field('bank_statement_import_view');
						}
					});
				}

			}, 'Get Transaction');
		}

		
	},

	before_save: function(frm) {
		// console.log(" this len ", frm.doc.bank_statement_import_view.length)
		if(frm.doc.bank_statement_import_view.length > 0 && frm.doc.bank_statement_import_view.length > 0 ){

			frm.clear_table("list_of_unpresented_cheques")
			frm.clear_table("list_of_uncredited_cheques")

			frm.call({
				doc: frm.doc,
				method: "match_table_one_two",
				callback: function() {
					frm.refresh_field('bank_statement_import_view');
					frm.refresh_field('bank_reconciliation_entries');

					
				

					frm.call({
						doc: frm.doc,
						method: 'get_unpresented_cheque',
						freeze_message: __('Adding Reconsiling Entries'),
						callback: function() {
							console.log(" this is 3 and 4 0000000000000000")
							// frm.refresh_field('get_unpresented_cheque');
							// frm.refresh_field('get_uncredited_cheque');
		
							var total_receipt = 0;
							var total_payment= 0;
							$.each(frm.doc.bank_reconciliation_entries, function(index, row){
								console.log(" this is row ", row.receipt)
								total_receipt = total_receipt + row.receipt;	
								total_payment = total_payment + row.payment;		
								});
							frm.set_value('total_receipt', total_receipt);
							// frm.refresh_field("total_receipt")
						
							frm.set_value('total_payment', total_payment);
							// frm.refresh_field("total_payment")
		
							var total_unpresented_cheque = 0;
							$.each(frm.doc.list_of_unpresented_cheques, function(index, row){
								total_unpresented_cheque = total_unpresented_cheque + row.amount;
								});
							frm.set_value('total_unpresented_cheques', total_unpresented_cheque);
							frm.set_value('unpresented_cheques', total_unpresented_cheque);
							// frm.refresh_field("total_unpresented_cheques")
		
		
							var total_uncredited_cheques = 0;
							$.each(frm.doc.list_of_uncredited_cheques, function(index, row){
								total_uncredited_cheques = total_uncredited_cheques + row.amount;
								});
							frm.set_value('total_uncredited_cheques', total_uncredited_cheques);	
							frm.set_value('uncredited_cheques', total_uncredited_cheques);
							// frm.refresh_field("total_uncredited_cheques")

							// Balance at bank statement + Total uncredited cheque - total unpresented cheque.
							let bal_bank = 0
							let bal_cash = 0

							bal_cash = flt(frm.doc.balance_at_bank_statement) + flt(frm.doc.total_uncredited_cheques) - flt(frm.doc.total_unpresented_cheques)

							frm.set_value('balance_at_cash_book', bal_cash)
							
							
							let rbb = flt(frm.doc.unreconciled_receipt) - flt(frm.doc.unreconciled_payment) +  flt(frm.doc.balance_per_bank_statement)
							frm.set_value('reconciled_bank_balance', rbb)
							
							console.log(" this is rrb", rbb)
							bal_bank = flt(frm.doc.reconciled_bank_balance) - flt(frm.doc.balance_at_cash_book)
							frm.set_value('reconciling_different', bal_bank)
							}
						});
				}			
			})

			// frm.call({
			// 	doc: frm.doc,
			// 	method: 'get_unpresented_cheque',
			// 	freeze_message: __('Adding Reconsiling Entries'),
			// 	callback: function() {
			// 		console.log(" this is 3 and 4 0000000000000000")
			// 		frm.refresh_field('get_unpresented_cheque');
			// 		frm.refresh_field('get_uncredited_cheque');

			// 		var total_receipt = 0;
			// 		var total_payment= 0;
			// 		$.each(frm.doc.bank_reconciliation_entries, function(index, row){
			// 			console.log(" this is row ", row.receipt)
			// 			total_receipt = total_receipt + row.receipt;	
			// 			total_payment = total_payment + row.payment;		
			// 			});
			// 		frm.set_value('total_receipt', total_receipt);
			// 		// frm.refresh_field("total_receipt")
				
			// 		frm.set_value('total_payment', total_payment);
			// 		// frm.refresh_field("total_payment")

			// 		var total_unpresented_cheque = 0;
			// 		$.each(frm.doc.list_of_unpresented_cheques, function(index, row){
			// 			total_unpresented_cheque = total_unpresented_cheque + row.amount;
			// 			});
			// 		frm.set_value('total_unpresented_cheques', total_unpresented_cheque);
			// 		// frm.refresh_field("total_unpresented_cheques")


			// 		var total_uncredited_cheques = 0;
			// 		$.each(frm.doc.list_of_uncredited_cheques, function(index, row){
			// 			total_uncredited_cheques = total_uncredited_cheques + row.amount;
			// 				});
			// 		frm.set_value('total_uncredited_cheques', total_uncredited_cheques);	
			// 		// frm.refresh_field("total_uncredited_cheques")
			// 				}
			// 			});
		}
		
        // var total_receipt = 0;
		// var total_payment= 0;
		// $.each(frm.doc.bank_reconciliation_entries, function(index, row){
		// 	console.log(" this is row ", row.receipt)
		// 	total_receipt = total_receipt + row.receipt;	
		// 	total_payment = total_payment + row.payment;		
    	// 	});
		// frm.set_value('total_receipt', total_receipt);
		// frm.refresh_field("total_receipt")
   	
		// frm.set_value('total_payment', total_payment);
		// frm.refresh_field("total_payment")
			

		
			
		// var total_direct_withdrawal = 0;
		// $.each(frm.doc.list_of_direct_withdrawal, function(index, row){
		// 		total_direct_withdrawal = total_direct_withdrawal + row.amount;
		// 		});
		// 	frm.set_value('total_direct_withdrawal', total_direct_withdrawal);	
	//Addition of Amount column of child Table Called List of Direct Lodgmen

			// var direct_lodgment = frm.doc.list_of_direct_lodgment;
			// var total_direct_lodgment = 0;
			// $.each(direct_lodgment, function(index, row){
			// 	total_direct_lodgment = total_direct_lodgment + row.amount;
			// 	frm.set_value('total_direct_lodgment', total_direct_lodgment);
			// 	});
	
	//To Calculate balance At Bank On The Reconciliation Statement
			// frm.set_value('balance_at_bank_statement', frm.doc.balance_per_bank_statement * 1);
	
	//To Calculate Unpresented Cheques At Bank On The Reconciliation Statement
			// frm.set_value('unpresented_cheques', frm.doc.total_unpresented_cheques * 1);
			
	//To Calculate Uncredited Cheques At Bank On The Reconciliation Statement
			// frm.set_value('uncredited_cheques', frm.doc.total_uncredited_cheques * 1);
		
	//To Calculate Balance At Cash Book On The Reconciliation Statemen
			// frm.set_value('balance_at_cash_book', frm.doc.balance_at_bank_statement + (frm.doc.uncredited_cheques - frm.doc.unpresented_cheques));	

		// if(frm.doc.list_of_uncredited_cheques){

		// }
	},

	update_payment_entries_dw: function(frm){
		if(frm.doc.docstatus == 0 ){
			console.log(" update_payment_entries_dw button Clicked")
			frm.clear_table("list_of_direct_withdrawal")
			frm.call({
				doc: frm.doc,
				method: "direct_withdraw",
				callback: function() {
					console.log(" returnn from direct_withdrawal")

				}
			});
			frm.refresh_field("list_of_direct_withdrawal")
			frm.refresh_field("total_direct_withdrawal")
		}
	},


	update_payment_entries_dl: function(frm){
		if(frm.doc.docstatus == 0 ){
			console.log(" update_payment_entries_dl button Clicked")
			frm.clear_table("list_of_direct_lodgment")
			frm.call({
				doc: frm.doc,
				method: "direct_lodgment",
				callback: function() {
					console.log(" returnn from direct_lodgment")
				}
			});
			
			frm.refresh_field("list_of_direct_lodgment")
			frm.refresh_field("total_direct_lodgment")
		}
	},
});
