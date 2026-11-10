// unit3-week9 — what a real app answered to every json-check task, captured from a real
// Spring Boot 4.1.1 build on MySQL 8.0 (headless Chrome 156, 2026-11-03).
//
// EX: the finished stage's answer (the task's `example`). PREV: the answer of the stage
// BEFORE the task's feature (the task's `previousStage`): Week 8's final app for new
// endpoints, a lab's first (incomplete) version for the 404 and 409 tasks, and the page
// without the new control for the Part 2 tasks. Ids, timestamps and the random snack
// numbers differ on every run; the shape and the statuses are what matter. Never shown to students.

export const EX = {
  d1Roundtrip: "{\"put_status\":200,\"snack_id\":85906,\"name\":\"Renamed 85906\",\"price\":21,\"others_unchanged\":true}",
  d1NotFound: "{\"status\":404,\"message\":\"No snack with id 99999\",\"nothing_changed\":true}",
  d1Blank: "{\"timestamp\":\"2026-11-03T04:13:21.516Z\",\"status\":400,\"error\":\"Bad Request\",\"message\":\"name must not be blank\",\"path\":\"/api/snacks/90\"}",
  d1Price: "{\"timestamp\":\"2026-11-03T04:13:23.268Z\",\"status\":400,\"error\":\"Bad Request\",\"message\":\"price must be from 1 to 1000\",\"path\":\"/api/snacks/90\"}",
  d1Same: "{\"status\":200,\"name_back\":\"Kutsinta\",\"price_back\":10}",
  d1PageEdit: "{\"on_edit_page\":true,\"number_shown\":\"90\",\"prefilled_name\":\"Kutsinta\",\"message_on_page\":\"Saved: Kutsinta at ₱12\",\"price_changed_in_mysql\":true}",
  d1PageUnknown: "{\"on_edit_page\":true,\"status_on_page\":\"Sorry: No snack with id 99999\"}",
  d2Roundtrip: "{\"put_status\":200,\"qty\":19,\"total_is_qty_times_price_paid\":true,\"others_unchanged\":true}",
  d2History: "{\"qty_after\":3,\"qty_changed\":true,\"total_after\":21,\"kept_price_paid_7\":true}",
  d2Qty25: "{\"timestamp\":\"2026-11-03T04:13:50.574Z\",\"status\":400,\"error\":\"Bad Request\",\"message\":\"qty must be from 1 to 20\",\"path\":\"/api/orders/99999\"}",
  d2NotFound: "{\"status\":404,\"message\":\"No order with id 99999\",\"nothing_changed\":true}",
  d2Board: "{\"board_has_message_line\":true,\"row_found\":true,\"row_has_change_control\":true,\"qty_on_row_after\":19,\"message_on_page\":\"Order 15 now has 19 × Kutsinta = ₱190\"}",
  d3Roundtrip: "{\"first_status\":204,\"first_body_empty\":true,\"lookup_status\":404,\"second_status\":404,\"second_message\":\"No order with id 14\",\"other_orders_kept\":true}",
  d3NotFound: "{\"status\":404,\"empty_body\":false,\"message\":\"No order with id 99999\"}",
  d3Board: "{\"row_found\":true,\"row_has_cancel_button\":true,\"row_gone_from_board\":true,\"message_on_page\":\"Order 15 is cancelled.\",\"order_gone_in_mysql\":true}",
  d4Lifecycle: "{\"created_status\":201,\"delete_status\":204,\"delete_body_empty\":true,\"lookup_status\":404,\"delete_again_status\":404}",
  d4Wall: "{\"wall_status\":409,\"wall_message\":\"Snack 77121 is used by a sale or a special\",\"cancel_status\":204,\"delete_after_cancel_status\":204}",
  d4NotFound: "{\"status\":404,\"empty_body\":false,\"message\":\"No snack with id 99999\"}",
  d4Kutsinta: "{\"has_sales\":true,\"delete_status\":409,\"message\":\"Snack 90 is used by a sale or a special\",\"still_on_menu\":true}",
  d4PageWall: "{\"has_remove_button\":true,\"has_sales\":true,\"message_on_page\":\"Sorry: Snack 90 is used by a sale or a special\",\"still_on_menu\":true}",
  d4PageRemove: "{\"has_remove_button\":true,\"message_on_page\":\"Snack 8000 is off the menu.\",\"snack_gone_in_mysql\":true}",
  d5SpecialPut: "{\"name\":\"Kutsinta\",\"put_status\":200,\"answer_agrees\":true,\"changed\":true,\"delete_status\":204,\"older_special_unchanged\":true}",
  d5SpecialZero: "{\"timestamp\":\"2026-11-03T04:15:26.923Z\",\"status\":400,\"error\":\"Bad Request\",\"message\":\"special_price must be from 1 to 1000\",\"path\":\"/api/special\"}",
  d5SpecialRemove: "{\"marked\":true,\"first_status\":204,\"first_body_empty\":true,\"marked_special_gone\":true}",
  d5PageSpecial: "{\"on_special_page\":true,\"message_on_page\":\"The special is now ₱8\",\"current_shows_new_price\":true,\"price_changed_in_mysql\":true}",
  d5PageRemove: "{\"on_special_page\":true,\"message_on_page\":\"The special is removed.\",\"current_line_updated\":true,\"marked_special_gone_in_mysql\":true}",
};

export const PREV = {
  d1Roundtrip: "{\"put_status\":405,\"snack_id\":46892,\"name\":\"Check 46892\",\"price\":14,\"others_unchanged\":true}",
  d1NotFound: "{\"status\":200,\"nothing_changed\":true}",
  d1Blank: "{\"timestamp\":\"2026-11-03T04:12:53.497Z\",\"status\":405,\"error\":\"Method Not Allowed\",\"message\":\"Method 'PUT' is not supported.\",\"path\":\"/api/snacks/90\"}",
  d1Price: "{\"timestamp\":\"2026-11-03T04:12:55.224Z\",\"status\":405,\"error\":\"Method Not Allowed\",\"message\":\"Method 'PUT' is not supported.\",\"path\":\"/api/snacks/90\"}",
  d1Same: "{\"status\":405}",
  d1PageEdit: "{\"on_edit_page\":false}",
  d1PageUnknown: "{\"on_edit_page\":false}",
  d2Roundtrip: "{\"put_status\":405,\"qty\":2,\"total_is_qty_times_price_paid\":false,\"others_unchanged\":true}",
  d2History: "{\"qty_changed\":false,\"kept_price_paid_7\":false}",
  d2Qty25: "{\"timestamp\":\"2026-11-03T04:13:37.066Z\",\"status\":405,\"error\":\"Method Not Allowed\",\"message\":\"Method 'PUT' is not supported.\",\"path\":\"/api/orders/99999\"}",
  d2NotFound: "{\"status\":405,\"message\":\"Method 'PUT' is not supported.\",\"nothing_changed\":true}",
  d2Board: "{\"board_has_message_line\":false}",
  d3Roundtrip: "{\"first_status\":405,\"first_body_empty\":false,\"lookup_status\":200,\"second_status\":405,\"second_message\":\"Method 'DELETE' is not supported.\",\"other_orders_kept\":false}",
  d3NotFound: "{\"status\":204,\"empty_body\":true,\"message\":\"\"}",
  d3Board: "{\"row_found\":true,\"row_has_cancel_button\":false}",
  d4Lifecycle: "{\"created_status\":201,\"delete_status\":405,\"delete_body_empty\":false,\"lookup_status\":200,\"delete_again_status\":405}",
  d4Wall: "{\"wall_status\":500,\"wall_message\":\"PreparedStatementCallback; SQL [DELETE FROM snacks WHERE snack_id = ?]; Cannot delete or update a parent row: a foreign key constraint fails (`school`.`sales`, CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`snack_id`) REFERENCES `snacks` (`snack_id`))\",\"cancel_status\":204,\"delete_after_cancel_status\":204}",
  d4NotFound: "{\"status\":405,\"empty_body\":false,\"message\":\"Method 'DELETE' is not supported.\"}",
  d4Kutsinta: "{\"has_sales\":true,\"delete_status\":500,\"message\":\"PreparedStatementCallback; SQL [DELETE FROM snacks WHERE snack_id = ?]; Cannot delete or update a parent row: a foreign key constraint fails (`school`.`sales`, CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`snack_id`) REFERENCES `snacks` (`snack_id`))\",\"still_on_menu\":true}",
  d4PageWall: "{\"has_remove_button\":false}",
  d4PageRemove: "{\"has_remove_button\":false}",
  d5SpecialPut: "{\"name\":\"Kutsinta\",\"put_status\":405,\"answer_agrees\":false,\"changed\":false,\"delete_status\":405,\"older_special_unchanged\":true}",
  d5SpecialZero: "{\"timestamp\":\"2026-11-03T04:15:09.214Z\",\"status\":405,\"error\":\"Method Not Allowed\",\"message\":\"Method 'PUT' is not supported.\",\"path\":\"/api/special\"}",
  d5SpecialRemove: "{\"marked\":false,\"first_status\":405,\"first_body_empty\":false,\"marked_special_gone\":true}",
  d5PageSpecial: "{\"on_special_page\":false}",
  d5PageRemove: "{\"on_special_page\":false}",
};
