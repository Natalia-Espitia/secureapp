package com.arep.secureapp;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class HelloControllerTests {

	@Test
	void healthEndpointReturnsExpectedValue() {
		HelloController controller = new HelloController();
		assertEquals("secureapp-backend-ok", controller.index());
	}
}
